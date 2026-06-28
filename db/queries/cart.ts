import "server-only";

import { db } from "@/db/index";
import {
  cart,
  cartItem,
  program,
  programSession,
  adultRegistration,
  juniorProgramRegistration,
} from "@/db/schema";
import { eq, and, asc, isNull, inArray, or, gt, sql } from "drizzle-orm";
import { checkTimeSlotAvailability } from "./bookings";

/**
 * Get cart by session ID
 */
export async function getCartBySessionId(sessionId: string) {
  const carts = await db
    .select()
    .from(cart)
    .where(eq(cart.sessionId, sessionId))
    .limit(1);

  return carts[0] || null;
}

/**
 * Get cart with items by session ID
 */
export async function getCartWithItems(sessionId: string) {
  const cartData = await getCartBySessionId(sessionId);

  if (!cartData) {
    return null;
  }

  const items = await db
    .select({
      id: cartItem.id,
      cartId: cartItem.cartId,
      programId: cartItem.programId,
      programSessionId: cartItem.programSessionId,
      registrationType: cartItem.registrationType,
      quantity: cartItem.quantity,
      priceAtAdd: cartItem.priceAtAdd,
      createdAt: cartItem.createdAt,
      metadata: cartItem.metadata,
      program: {
        id: program.id,
        name: program.name,
        description: program.description,
        type: program.type,
        price: program.price,
        duration: program.duration,
        imageUrl: program.imageUrl,
        schedulingType: program.schedulingType,
        pricingOptions: program.pricingOptions,
      },
      session: {
        id: programSession.id,
        name: programSession.name,
        startDate: programSession.startDate,
        endDate: programSession.endDate,
        schedule: programSession.schedule,
        capacity: programSession.capacity,
        enrolledCount: programSession.enrolledCount,
      },
    })
    .from(cartItem)
    .leftJoin(program, eq(cartItem.programId, program.id))
    .leftJoin(programSession, eq(cartItem.programSessionId, programSession.id))
    .where(eq(cartItem.cartId, cartData.id))
    .orderBy(asc(cartItem.createdAt));

  // Calculate real-time enrolled counts for sessions in the cart
  const sessionIds = items
    .map((item) => item.programSessionId)
    // Filter out nulls and duplicates
    .filter((id): id is string => id !== null)
    .filter((id, index, self) => self.indexOf(id) === index);

  if (sessionIds.length > 0) {
    // Fetch counts in parallel
    // Logic: Count only confirmed (paid) registrations as we don't do holds
    // We replicate the logic from checkProgramSessionCapacity
    // We can't import the helper function easily so we reconstruct the condition
    // For raw SQL builder in simple select, it's slightly verbose but safer to correct the count

    const [adultCounts, juniorCounts] = await Promise.all([
      db
        .select({
          sessionId: adultRegistration.programSessionId,
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(adultRegistration)
        .where(
          and(
            inArray(adultRegistration.programSessionId, sessionIds),
            eq(adultRegistration.paymentStatus, "paid"),
          ),
        )
        .groupBy(adultRegistration.programSessionId),
      db
        .select({
          sessionId: juniorProgramRegistration.programSessionId,
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(juniorProgramRegistration)
        .where(
          and(
            inArray(juniorProgramRegistration.programSessionId, sessionIds),
            eq(juniorProgramRegistration.paymentStatus, "paid"),
          ),
        )
        .groupBy(juniorProgramRegistration.programSessionId),
    ]);

    // Create separate maps for adult and junior counts
    const adultCountMap = new Map<string, number>();
    const juniorCountMap = new Map<string, number>();

    // Helper to populate maps
    const populateMap = (
      source: { sessionId: string | null; count: number }[],
      targetMap: Map<string, number>,
    ) => {
      source.forEach((r) => {
        if (r.sessionId) {
          targetMap.set(
            r.sessionId,
            (targetMap.get(r.sessionId) || 0) + r.count,
          );
        }
      });
    };

    populateMap(adultCounts, adultCountMap);
    populateMap(juniorCounts, juniorCountMap);

    // Update items with real-time enrolledCount based on program type
    items.forEach((item) => {
      if (item.programSessionId && item.session && item.program) {
        let realtimeCount = 0;

        // STRICTLY check the table that matches the program type
        // This mirrors checkProgramSessionCapacity logic
        if (item.program.type === "adult") {
          realtimeCount = adultCountMap.get(item.programSessionId) || 0;
        } else {
          realtimeCount = juniorCountMap.get(item.programSessionId) || 0;
        }

        item.session.enrolledCount = realtimeCount;
      }
    });
  }

  // Check availability for Private Instruction items
  for (const item of items) {
    if (item.metadata && !item.session) {
      try {
        const slotData = JSON.parse(item.metadata);
        const slots = slotData.slots || (slotData.date ? [slotData] : []);

        for (const slot of slots) {
          const dateStr = typeof slot.date === "string" ? slot.date.split("T")[0] : "";
          const baseDate = dateStr.includes("-") 
            ? new Date(Number(dateStr.split("-")[0]), Number(dateStr.split("-")[1]) - 1, Number(dateStr.split("-")[2]))
            : new Date(slot.date);
          const [startH, startM] = slot.startTime.split(":").map(Number);
          const [endH, endM] = slot.endTime.split(":").map(Number);

          const startDate = new Date(baseDate);
          startDate.setHours(startH, startM, 0, 0);

          const endDate = new Date(baseDate);
          endDate.setHours(endH, endM, 0, 0);

          // Check availability
          const availability = await checkTimeSlotAvailability(
            startDate,
            endDate,
          );

          if (!availability.available) {
            // Attach availability status to the item
            // We need to extend the type returned or just attach it as a property
            // Since we are returning raw DB result + extras, we can cast or just assign
            (item as any).availability = {
              isAvailable: false,
              error:
                availability.reason === "hold_active"
                  ? "This slot is currently on hold."
                  : "This slot is no longer available.",
            };
            break; // Stop checking other slots for this item
          }
        }

        // If we went through all slots and found no issues, mark as available
        if (!(item as any).availability) {
          (item as any).availability = { isAvailable: true };
        }
      } catch (error) {
        console.error("Error checking private instruction availability", error);
        (item as any).availability = {
          isAvailable: false,
          error: "Error validating slot.",
        };
      }
    } else {
      // For session based items, we already did logic above, but let's standardize the availability object
      if (item.session) {
        const enrolled = item.session.enrolledCount ?? 0;
        const maxQuantity = Math.max(0, item.session.capacity - enrolled);
        const isSoldOut = maxQuantity === 0;
        const hasInsufficientQuantity = item.quantity > maxQuantity;

        if (isSoldOut || hasInsufficientQuantity) {
          (item as any).availability = {
            isAvailable: false,
            error: isSoldOut ? "Sold Out" : `Only ${maxQuantity} available`,
          };
        } else {
          (item as any).availability = { isAvailable: true };
        }
      }
    }
  }

  return {
    ...cartData,
    items,
  };
}

/**
 * Create a new cart for a session
 */
export async function createCart(sessionId: string, userId?: string) {
  const result = await db
    .insert(cart)
    .values({
      sessionId,
      userId,
    })
    .returning();

  return result[0];
}

/**
 * Get or create cart for a session
 */
export async function getOrCreateCart(sessionId: string, userId?: string) {
  const existingCart = await getCartBySessionId(sessionId);

  if (existingCart) {
    // Update expiry on access
    await db
      .update(cart)
      .set({ updatedAt: new Date() })
      .where(eq(cart.id, existingCart.id));

    return existingCart;
  }

  return await createCart(sessionId, userId);
}

/**
 * Add item to cart
 */
/**
 * Add item to cart
 */
export async function addItemToCart(data: {
  cartId: string;
  programId: string;
  programSessionId?: string;
  registrationType: "adult" | "junior";
  quantity?: number;
  priceAtAdd: string;
  metadata?: string;
}) {
  // Check if item already exists in cart (same program + session + same metadata)
  // For private instruction, metadata contains the slot time, so different slots = different items
  const existingItems = await db
    .select()
    .from(cartItem)
    .where(
      and(
        eq(cartItem.cartId, data.cartId),
        eq(cartItem.programId, data.programId),
        data.programSessionId
          ? eq(cartItem.programSessionId, data.programSessionId)
          : isNull(cartItem.programSessionId),
      ),
    );

  // Filter in memory for metadata match since equating text/json in SQL can be tricky/strict
  const matchingItem = existingItems.find(
    (item) =>
      item.programSessionId === (data.programSessionId || null) &&
      item.metadata === (data.metadata || null),
  );

  if (matchingItem) {
    // Update quantity instead of adding duplicate
    const result = await db
      .update(cartItem)
      .set({
        quantity: matchingItem.quantity + (data.quantity || 1),
        updatedAt: new Date(),
      })
      .where(eq(cartItem.id, matchingItem.id))
      .returning();

    return result[0];
  }

  // Add new item
  const result = await db
    .insert(cartItem)
    .values({
      cartId: data.cartId,
      programId: data.programId,
      programSessionId: data.programSessionId,
      registrationType: data.registrationType,
      quantity: data.quantity || 1,
      priceAtAdd: data.priceAtAdd,
      metadata: data.metadata,
    })
    .returning();

  return result[0];
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    return await removeCartItem(itemId);
  }

  const result = await db
    .update(cartItem)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(cartItem.id, itemId))
    .returning();

  return result[0];
}

/**
 * Update cart item price (after server-side reconciliation)
 */
export async function updateCartItemPrice(itemId: string, priceAtAdd: string) {
  const result = await db
    .update(cartItem)
    .set({ priceAtAdd, updatedAt: new Date() })
    .where(eq(cartItem.id, itemId))
    .returning();

  return result[0];
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemId: string) {
  await db.delete(cartItem).where(eq(cartItem.id, itemId));
  return { success: true };
}

/**
 * Clear all items from cart
 */
export async function clearCart(cartId: string) {
  await db.delete(cartItem).where(eq(cartItem.cartId, cartId));
  return { success: true };
}

/**
 * Get cart item count
 */
export async function getCartItemCount(sessionId: string) {
  const cartData = await getCartBySessionId(sessionId);

  if (!cartData) {
    return 0;
  }

  const items = await db
    .select({ quantity: cartItem.quantity })
    .from(cartItem)
    .where(eq(cartItem.cartId, cartData.id));

  return items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Delete cart (after successful checkout)
 */
export async function deleteCart(cartId: string) {
  await db.delete(cart).where(eq(cart.id, cartId));
  return { success: true };
}

/**
 * Calculate cart total
 */
export async function getCartTotal(cartId: string) {
  const items = await db
    .select({
      quantity: cartItem.quantity,
      priceAtAdd: cartItem.priceAtAdd,
    })
    .from(cartItem)
    .where(eq(cartItem.cartId, cartId));

  const rawTotal = items.reduce((total, item) => {
    return total + item.quantity * parseFloat(item.priceAtAdd);
  }, 0);
  // Round to 2 decimal places to avoid floating-point precision errors (e.g. $474.99 instead of $475.00)
  return Math.round(rawTotal * 100) / 100;
}
