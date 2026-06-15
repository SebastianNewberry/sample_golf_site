"use server";

import { cookies } from "next/headers";
import {
  getOrCreateCart,
  addItemToCart,
  getCartWithItems,
  removeCartItem,
  updateCartItemQuantity,
  clearCart,
  getCartItemCount,
  getCartTotal,
} from "@/db/queries/cart";
import { getProgramById, getSlotEnrollmentCount } from "@/db/queries/programs";
import { reconcileCartPricing } from "@/lib/cart-pricing";

const CART_SESSION_COOKIE = "cart_session_id";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Get or create a cart session ID from cookies
 *
 * NOTE: In Next.js 15, cookies can be set in Server Actions.
 * The cookie will be included in the response to the client.
 */
async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existingSessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

  if (existingSessionId) {
    return existingSessionId;
  }

  // Generate a new session ID using built-in crypto
  const newSessionId = crypto.randomUUID();

  // Set the cookie - this works in Server Actions in Next.js 15
  // The cookie is included in the Set-Cookie header of the response
  cookieStore.set(CART_SESSION_COOKIE, newSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return newSessionId;
}

/**
 * Get the current session ID (for read-only operations)
 */
async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;
}

/**
 * Add a program to the cart
 */
export async function addToCart(data: {
  programId: string;
  programSessionId?: string;
  registrationType: "adult" | "junior";
  price: number;
  metadata?: string;
  quantity?: number;
}) {
  try {
    const sessionId = await getOrCreateSessionId();
    const cart = await getOrCreateCart(sessionId);

    // Fetch the program to validate price and rules
    const programData = await getProgramById(data.programId);
    if (!programData) {
      return { success: false, error: "Program not found" };
    }

    let finalPrice = data.price; // Start with frontend price
    let validated = false;

    console.log("PROGRAM DATA IS", programData);

    // Determine if this is a Private Instruction / Appointment or Series
    const isPrivateInstruction =
      programData.schedulingType === "appointment" ||
      programData.schedulingType === "series" ||
      programData.type === "private" ||
      programData.type === "junior_private" ||
      programData.id === "f89b62ee-ffda-421d-a525-8bd2a580f24e" || // Adult Private ID
      programData.id === "754bf4be-0ef6-4123-b5ff-b107e03c2f10"; // Junior Private ID

    // Secure Validation logic for Private Instructions (Appointments)
    if (isPrivateInstruction) {
      if (!programData.pricingOptions) {
        // Fallback to base program price if no options exist but it's an appointment
        if (data.price !== Number(programData.price)) {
          return {
            success: false,
            error: "Invalid base price for appointment.",
          };
        }
        finalPrice = Number(programData.price);
        validated = true;
      } else {
        // Handle JSON pricing options
        let options: any[] = [];
        try {
          options =
            typeof programData.pricingOptions === "string"
              ? JSON.parse(programData.pricingOptions)
              : programData.pricingOptions;
        } catch (e) {
          console.error("Error parsing pricing options", e);
        }

        // We need the frontend to send the packageId in metadata
        // For now, if we don't have packageId, we try to match by price and sessionCount...
        // But the best is extracting it from metadata if they sent it
        let metadataObj: any = {};
        if (data.metadata) {
          try {
            metadataObj = JSON.parse(data.metadata);
          } catch (e) {}
        }

        const packageId = metadataObj.packageId;
        let matchedOption = null;

        if (packageId) {
          matchedOption = options.find((o) => o.id === packageId);
        } else {
          // Fallback matching logic (if frontend hasn't been updated to send packageId yet)
          // We look for an option with matching price.
          matchedOption = options.find(
            (o) => Number(o.price) === Number(data.price),
          );
        }

        if (!matchedOption) {
          return { success: false, error: "Invalid pricing package selected." };
        }

        // Strict validation!
        console.log("DEBUG ADD TO CART VALIDATION:", {
          frontendPrice: data.price,
          packageId,
          matchedOptionPrice: matchedOption.price,
          frontendPriceType: typeof data.price,
          matchedOptionPriceType: typeof matchedOption.price,
        });

        // Round to nearest penny to avoid JS floating point comparison errors
        const clientPrice = Math.round(Number(data.price) * 100);
        const serverPrice = Math.round(Number(matchedOption.price) * 100);

        if (clientPrice !== serverPrice) {
          return {
            success: false,
            error: "Price mismatch. Security validation failed.",
          };
        }

        // Extract slots for validation
        let slotsToValidate: any[] = [];
        if (Array.isArray(metadataObj.slots)) {
          slotsToValidate = metadataObj.slots;
        } else if (
          metadataObj.date &&
          metadataObj.startTime &&
          metadataObj.endTime
        ) {
          slotsToValidate = [
            {
              date: metadataObj.date,
              startTime: metadataObj.startTime,
              endTime: metadataObj.endTime,
            },
          ];
        }

        const numSlots = slotsToValidate.length;

        // Validate session count
        if (numSlots !== Number(matchedOption.sessionCount)) {
          return {
            success: false,
            error: `This package requires exactly ${matchedOption.sessionCount} sessions.`,
          };
        }

        // Strict Duration Validation (skip for series - series slots are pre-defined whole sessions)
        if (programData.schedulingType !== "series") {
          const expectedDurationMinutes =
            Number(matchedOption.durationMinutes) || 60; // Default to 60 if missing

          for (const slot of slotsToValidate) {
            if (slot.startTime && slot.endTime) {
              const [startHour, startMinute] = slot.startTime
                .split(":")
                .map(Number);
              const [endHour, endMinute] = slot.endTime.split(":").map(Number);

              const startTotalMinutes = startHour * 60 + startMinute;
              const endTotalMinutes = endHour * 60 + endMinute;

              let duration = endTotalMinutes - startTotalMinutes;
              if (duration < 0) duration += 24 * 60; // Handle midnight crossing safely

              if (duration !== expectedDurationMinutes) {
                return {
                  success: false,
                  error: `Security Check Failed: Invalid session duration. Expected ${expectedDurationMinutes} minutes, but requested ${duration} minutes.`,
                };
              }
            }
          }
        }

        // Per-slot capacity validation for Series programs
        if (programData.schedulingType === "series" && data.programSessionId) {
          const capacity = programData.seriesCapacityPerSlot || 999;
          for (const slot of slotsToValidate) {
            const enrolledCount = await getSlotEnrollmentCount(
              data.programSessionId,
              slot.date,
              slot.startTime,
            );
            if (enrolledCount >= capacity) {
              return {
                success: false,
                error: `The session on ${slot.date} at ${slot.startTime} is full (${capacity}/${capacity} spots taken).`,
              };
            }
          }
        }

        finalPrice = Number(matchedOption.price);
        validated = true;

        // For private instructions: store per-player price and quantity = total players
        // This allows adding/removing individual players in the cart
        const basePlayersCount = Number(matchedOption.playersCount) || 1;
        const perPlayerPrice =
          Math.round((finalPrice / basePlayersCount) * 100) / 100;
        const totalPlayers = data.quantity || basePlayersCount;

        // Validate that requested players >= base players
        if (totalPlayers < basePlayersCount) {
          return {
            success: false,
            error: `This package requires at least ${basePlayersCount} players.`,
          };
        }

        const item = await addItemToCart({
          cartId: cart.id,
          programId: data.programId,
          programSessionId: data.programSessionId,
          registrationType: data.registrationType,
          priceAtAdd: perPlayerPrice.toFixed(2),
          metadata: data.metadata,
          quantity: totalPlayers,
        });

        return {
          success: true,
          item,
          message: "Added to cart!",
        };
      }
    } else {
      // Standard programs (Group sessions)
      const clientPrice = Math.round(Number(data.price) * 100);
      const serverPrice = Math.round(Number(programData.price) * 100);

      if (clientPrice !== serverPrice) {
        return {
          success: false,
          error: "Price mismatch. Security validation failed.",
        };
      }
      finalPrice = Number(programData.price);
      validated = true;
    }

    // Capacity validation for sessions
    const requestedQuantity = Math.max(
      1,
      Math.floor(Number(data.quantity) || 1),
    );

    if (data.programSessionId) {
      const { available, remaining } = await checkProgramSessionCapacity(
        data.programSessionId,
      );

      const cartItems = await getCartWithItems(sessionId);
      const currentInCart =
        cartItems?.items
          .filter((i) => i.programSessionId === data.programSessionId)
          .reduce((sum, i) => sum + i.quantity, 0) || 0;

      const maxCanAdd = remaining - currentInCart;

      if (!available || maxCanAdd <= 0) {
        return {
          success: false,
          error:
            remaining <= 0
              ? "This session is currently full."
              : `Only ${remaining} ${remaining === 1 ? "spot is" : "spots are"} available for this session, and you already have ${currentInCart} in your cart.`,
        };
      }

      if (requestedQuantity > maxCanAdd) {
        return {
          success: false,
          error: `Only ${maxCanAdd} ${maxCanAdd === 1 ? "spot is" : "spots are"} available for this session${currentInCart > 0 ? ` (${currentInCart} already in your cart)` : ""}.`,
        };
      }
    }

    const item = await addItemToCart({
      cartId: cart.id,
      programId: data.programId,
      programSessionId: data.programSessionId,
      registrationType: data.registrationType,
      priceAtAdd: finalPrice.toFixed(2), // Use strictly backend validated price
      metadata: data.metadata,
      quantity: requestedQuantity,
    });

    return {
      success: true,
      item,
      message: "Added to cart!",
    };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return {
      success: false,
      error: "Failed to add item to cart",
    };
  }
}

/**
 * Get the current cart with all items
 */
export async function getCart() {
  try {
    const sessionId = await getSessionId();

    if (!sessionId) {
      return {
        success: true,
        cart: null,
        items: [],
        total: 0,
        itemCount: 0,
      };
    }

    const cartData = await getCartWithItems(sessionId);

    if (!cartData) {
      return {
        success: true,
        cart: null,
        items: [],
        total: 0,
        itemCount: 0,
      };
    }

    if (cartData.items.length > 0) {
      await reconcileCartPricing(cartData.items);
    }

    const refreshedCart = await getCartWithItems(sessionId);
    if (!refreshedCart) {
      return {
        success: true,
        cart: null,
        items: [],
        total: 0,
        itemCount: 0,
      };
    }

    const total = await getCartTotal(refreshedCart.id);
    const itemCount = refreshedCart.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      success: true,
      cart: {
        id: refreshedCart.id,
        sessionId: refreshedCart.sessionId,
        createdAt: refreshedCart.createdAt,
        updatedAt: refreshedCart.updatedAt,
      },
      items: refreshedCart.items,
      total,
      itemCount,
      priceUpdates: undefined,
    };
  } catch (error) {
    console.error("Error getting cart:", error);
    return {
      success: false,
      error: "Failed to get cart",
      cart: null,
      items: [],
      total: 0,
      itemCount: 0,
    };
  }
}

/**
 * Get cart item count (for header badge)
 */
export async function getCartCount() {
  try {
    const sessionId = await getSessionId();

    if (!sessionId) {
      return { success: true, count: 0 };
    }

    const count = await getCartItemCount(sessionId);
    return { success: true, count };
  } catch (error) {
    console.error("Error getting cart count:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Remove an item from the cart
 */
export async function removeFromCart(itemId: string) {
  try {
    await removeCartItem(itemId);
    return { success: true, message: "Item removed from cart" };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, error: "Failed to remove item" };
  }
}

/**
 * Update item quantity in cart
 */
export async function updateCartItem(itemId: string, quantity: number) {
  try {
    const sessionId = await getSessionId();
    if (!sessionId) return { success: false, error: "Cart not found" };

    const cartData = await getCartWithItems(sessionId);
    const item = cartData?.items.find((i) => i.id === itemId);

    if (!item) return { success: false, error: "Item not found" };

    const programData = await getProgramById(item.programId);
    const isSeries = programData?.schedulingType === "series";

    // If increasing quantity, check capacity (group sessions only)
    if (
      quantity > item.quantity &&
      item.programSessionId &&
      !isSeries &&
      !item.metadata
    ) {
      const { remaining } = await checkProgramSessionCapacity(
        item.programSessionId,
      );

      // remaining is what's left in DB (Total Capacity - Enrolled).
      // Since 'Enrolled' does not include items in cart, 'remaining' represents the absolute ceiling for this item's quantity.
      if (quantity > remaining) {
        return {
          success: false,
          error: `Only ${remaining} ${remaining === 1 ? "spot is" : "spots are"} available for this session.`,
        };
      }
    }

    await updateCartItemQuantity(itemId, quantity);

    if (cartData.items.length > 0) {
      await reconcileCartPricing(
        cartData.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i,
        ),
      );
    }

    return { success: true, message: "Cart updated" };
  } catch (error) {
    console.error("Error updating cart:", error);
    return { success: false, error: "Failed to update cart" };
  }
}

/**
 * Clear the entire cart
 */
export async function emptyCart() {
  try {
    const sessionId = await getSessionId();

    if (!sessionId) {
      return { success: true, message: "Cart is already empty" };
    }

    const cartData = await getCartWithItems(sessionId);

    if (cartData) {
      await clearCart(cartData.id);
    }

    return { success: true, message: "Cart cleared" };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}

/**
 * Check if a program session has availability
 */
import { checkProgramSessionCapacity } from "@/db/queries/programs";

export async function checkSessionAvailability(sessionId: string) {
  try {
    const { available, remaining } =
      await checkProgramSessionCapacity(sessionId);
    return { success: true, available, remaining };
  } catch (error) {
    console.error("Error checking session availability:", error);
    return { success: false, error: "Failed to check availability" };
  }
}
