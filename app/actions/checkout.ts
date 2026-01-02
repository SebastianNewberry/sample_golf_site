"use server";

import { cookies } from "next/headers";
import { createPaymentIntent } from "@/lib/stripe";
import { getCartWithItems, deleteCart } from "@/db/queries/cart";
import {
  createCheckoutSession,
  updateCheckoutSessionPaymentIntent,
} from "@/db/queries/checkout-sessions";

const CART_SESSION_COOKIE = "cart_session_id";

interface AdultFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  additionalComments?: string;
}

interface JuniorFormData {
  primaryContactFirstName: string;
  primaryContactLastName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  phoneType: "mobile" | "home" | "work";
  preferredContactMethod: "text" | "email";
  childFirstName: string;
  childLastName: string;
  childAge: number;
  childExperienceLevel: string;
  hasOwnClubs: boolean;
  friendsToGroupWith?: string;
  additionalComments?: string;
}

interface CheckoutItem {
  cartItemId: string;
  programId: string;
  programSessionId?: string;
  registrationType: "adult" | "junior";
  formData: AdultFormData | JuniorFormData;
}

interface CheckoutData {
  items: CheckoutItem[];
  totalAmount: number;
}

/**
 * Process checkout - creates payment intent with all form data stored in database
 * Registrations are created ONLY after payment succeeds (in webhook)
 */
export async function processCheckout(data: CheckoutData) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

    if (!sessionId) {
      return {
        success: false,
        error: "No cart session found",
      };
    }

    // Verify cart exists and matches
    const cart = await getCartWithItems(sessionId);

    if (!cart) {
      return {
        success: false,
        error: "Cart not found",
      };
    }

    // Validate items match cart
    if (data.items.length !== cart.items.length) {
      return {
        success: false,
        error: "Cart has changed. Please refresh and try again.",
      };
    }

    // Get primary email from first form (for receipt)
    const primaryEmail = getPrimaryEmail(data.items[0]);

    // Generate unique checkout ID
    const checkoutId = crypto.randomUUID();

    // Store checkout data in database FIRST (before payment intent)
    // This ensures we have the form data available when webhook fires
    await createCheckoutSession({
      checkoutId,
      cartId: cart.id,
      formData: {
        items: data.items.map((item) => ({
          cartItemId: item.cartItemId,
          programId: item.programId,
          programSessionId: item.programSessionId,
          registrationType: item.registrationType,
          formData: item.formData as Record<string, unknown>,
        })),
      },
      totalAmount: data.totalAmount.toFixed(2),
    });

    // Create Stripe metadata (keep minimal - full data is in checkout_session table)
    const metadata: Record<string, string> = {
      checkoutId,
      cartId: cart.id,
      type: "cart_checkout",
      itemCount: data.items.length.toString(),
    };

    // Create payment intent
    const paymentResult = await createPaymentIntent({
      amount: Math.round(data.totalAmount * 100), // Convert to cents
      currency: "usd",
      customerEmail: primaryEmail,
      metadata,
      idempotencyKey: `checkout-${checkoutId}`,
    });

    if (!paymentResult.success) {
      return {
        success: false,
        error: "Failed to create payment intent. Please try again.",
      };
    }

    // Update checkout session with payment intent ID
    await updateCheckoutSessionPaymentIntent(
      checkoutId,
      paymentResult.paymentIntentId!
    );

    return {
      success: true,
      clientSecret: paymentResult.clientSecret,
      paymentIntentId: paymentResult.paymentIntentId,
      checkoutId,
    };
  } catch (error) {
    console.error("Error processing checkout:", error);
    return {
      success: false,
      error: "Failed to process checkout. Please try again.",
    };
  }
}

/**
 * Get primary email from form data
 */
function getPrimaryEmail(item: CheckoutItem): string {
  if (item.registrationType === "adult") {
    return (item.formData as AdultFormData).email;
  } else {
    return (item.formData as JuniorFormData).primaryContactEmail;
  }
}

/**
 * Clear cart after successful payment
 */
export async function clearCartAfterPayment(cartId: string) {
  try {
    await deleteCart(cartId);
    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false };
  }
}

