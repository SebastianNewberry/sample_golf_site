import "server-only";

import { db } from "@/db/index";
import { cart, cartItem, program, programSession } from "@/db/schema";
import { eq, and, asc, isNull } from "drizzle-orm";

const CART_EXPIRY_DAYS = 30;

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
      },
      session: {
        id: programSession.id,
        name: programSession.name,
        startDate: programSession.startDate,
        endDate: programSession.endDate,
        schedule: programSession.schedule,
      },
    })
    .from(cartItem)
    .leftJoin(program, eq(cartItem.programId, program.id))
    .leftJoin(programSession, eq(cartItem.programSessionId, programSession.id))
    .where(eq(cartItem.cartId, cartData.id))
    .orderBy(asc(cartItem.createdAt));

  return {
    ...cartData,
    items,
  };
}

/**
 * Create a new cart for a session
 */
export async function createCart(sessionId: string, userId?: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CART_EXPIRY_DAYS);

  const result = await db
    .insert(cart)
    .values({
      sessionId,
      userId,
      expiresAt,
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
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CART_EXPIRY_DAYS);

    await db
      .update(cart)
      .set({ expiresAt, updatedAt: new Date() })
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

  return items.reduce((total, item) => {
    return total + item.quantity * parseFloat(item.priceAtAdd);
  }, 0);
}
