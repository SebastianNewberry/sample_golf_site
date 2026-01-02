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
}) {
  try {
    const sessionId = await getOrCreateSessionId();
    const cart = await getOrCreateCart(sessionId);

    const item = await addItemToCart({
      cartId: cart.id,
      programId: data.programId,
      programSessionId: data.programSessionId,
      registrationType: data.registrationType,
      priceAtAdd: data.price.toFixed(2),
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

    const total = await getCartTotal(cartData.id);
    const itemCount = cartData.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return {
      success: true,
      cart: {
        id: cartData.id,
        sessionId: cartData.sessionId,
        createdAt: cartData.createdAt,
        updatedAt: cartData.updatedAt,
      },
      items: cartData.items,
      total,
      itemCount,
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
    await updateCartItemQuantity(itemId, quantity);
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
