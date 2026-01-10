"use server";

import { cookies } from "next/headers";
import stripe from "@/lib/stripe";
import { getCartWithItems, deleteCart } from "@/db/queries/cart";
import {
  createCheckoutSession,
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

    // Validate items match cart (check total quantity)
    const totalCartItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    if (data.items.length !== totalCartItems) {
      return {
        success: false,
        error: "Cart has changed or is incomplete. Please refresh and try again.",
      };
    }

    // Get primary email from first form (for receipt)
    const primaryEmail = getPrimaryEmail(data.items[0]);

    // Generate unique checkout ID
    const checkoutId = crypto.randomUUID();

    // Store checkout data in database FIRST (before payment intent)
    // This ensures we have the form data available when webhook fires
    const savedSession = await createCheckoutSession({
      checkoutId,
      cartId: cart.id,
      formData: {
        items: data.items.map((item) => {
          return {
            cartItemId: item.cartItemId,
            programId: item.programId,
            programSessionId: item.programSessionId,
            registrationType: item.registrationType,
            formData: item.formData as unknown as Record<string, unknown>,
          };
        }),
      },
      totalAmount: data.totalAmount.toFixed(2),
    });

    console.log(`[Checkout] Created session ${checkoutId} with ${data.items.length} items. DB ID: ${savedSession.id}`);

    // Create Stripe metadata (keep minimal - full data is in checkout_session table)
    const metadata: Record<string, string> = {
      checkoutId,
      cartId: cart.id,
      type: "cart_checkout",
      itemCount: data.items.length.toString(),
    };

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: primaryEmail,
      client_reference_id: checkoutId,
      metadata: {
        checkoutId,
        cartId: cart.id,
        type: "cart_checkout",
      },
      line_items: data.items.map((item) => {
        // Find the program details (safely)
        const cartItem = cart.items.find((ci) => ci.id === item.cartItemId);
        const programName = cartItem?.program?.name || "Golf Program";

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: programName,
              description: item.registrationType === "junior" ? "Junior Registration" : "Adult Registration",
              metadata: {
                programId: item.programId,
                programSessionId: item.programSessionId || "",
              }
            },
            unit_amount: Math.round(parseFloat(cartItem?.priceAtAdd || "0") * 100),
          },
          quantity: 1,
        };
      }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout?canceled=true`,
    });

    if (!session.url) {
      return {
        success: false,
        error: "Failed to create checkout session URL",
      };
    }

    return {
      success: true,
      url: session.url,
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

