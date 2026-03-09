"use server";

import { cookies } from "next/headers";
import stripe from "@/lib/stripe";
import { getCartWithItems, deleteCart } from "@/db/queries/cart";
import {
  createCheckoutSession,
  updateCheckoutSessionPaymentIntent,
} from "@/db/queries/checkout-sessions";

const CART_SESSION_COOKIE = "cart_session_id";

import { validateCartAvailability } from "@/app/actions/validation";
import { createBooking } from "@/db/queries/bookings";
import { getOrCreateRegularUser } from "@/db/queries/users";
import { createAdultRegistration } from "@/db/queries/adult-registrations";
import {
  createJuniorRegistration,
  createJuniorProgramRegistration,
  deleteJuniorProgramRegistration,
} from "@/db/queries/junior-registrations";
import { deleteAdultRegistration } from "@/db/queries/adult-registrations";
import { deleteBooking } from "@/db/queries/bookings";
import { checkProgramSessionCapacity } from "@/db/queries/programs";

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
  metadata?: string;
}

interface CheckoutData {
  items: CheckoutItem[];
  totalAmount: number;
}

/**
 * Process checkout - creates payment intent with all form data stored in database
 * Registrations are created ONLY after payment succeeds (in webhook)
 */
export async function createCheckoutPaymentIntent(data: CheckoutData) {
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
    const totalCartItems = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    if (data.items.length !== totalCartItems) {
      return {
        success: false,
        error:
          "Cart has changed or is incomplete. Please refresh and try again.",
      };
    }

    // --------------------------------------------------------
    // CAPACITY CHECK
    // --------------------------------------------------------
    // Passing cart.items (which has metadata) to validation
    const availability = await validateCartAvailability(
      cart.items,
      // No need to exclude checkout ID anymore since we aren't creating holds
    );
    if (!availability.valid) {
      let errorMessage = "Some items in your cart are no longer available.";

      if (availability.errors && Object.keys(availability.errors).length > 0) {
        const errorList = Object.values(availability.errors)
          .map((err) => `<li>${err}</li>`)
          .join("");
        errorMessage = `
          <p>The following issues were found:</p>
          <ul class="list-disc pl-5 my-2 text-sm text-left">
            ${errorList}
          </ul>
          <a href="/cart" class="text-blue-600 hover:underline mt-2 block font-medium">Return to Cart to fix issues</a>
        `;
      } else if (availability.error) {
        errorMessage = availability.error;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Get primary email from first form (for receipt)
    const primaryEmail = getPrimaryEmail(data.items[0]);

    // Generate unique checkout ID EARLY so we can use it in reservation notes
    const checkoutId = crypto.randomUUID();

    // --------------------------------------------------------
    // RESERVATION (HOLD) LOGIC REMOVED
    // --------------------------------------------------------
    // We actively chose NOT to hold spots.
    // Optimization: We check capacity right before payment (on client)
    // and relying on optimistic concurrency.
    // --------------------------------------------------------

    // --------------------------------------------------------
    // STRICT TOTAL CALCULATION
    // --------------------------------------------------------
    // Ignore data.totalAmount from the frontend.
    // Calculate uniquely from validated cart items exactly as they are in the DB.
    const serverTotalAmount = cart.items.reduce((sum, item) => {
      // priceAtAdd was already strictly validated when added to the cart
      return sum + Number(item.priceAtAdd) * item.quantity;
    }, 0);

    // Store checkout data in database
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
            metadata:
              cart.items.find((ci) => ci.id === item.cartItemId)?.metadata ||
              undefined,
            priceAtAdd:
              cart.items.find((ci) => ci.id === item.cartItemId)?.priceAtAdd ||
              "0",
          };
        }),
      },
      totalAmount: serverTotalAmount.toFixed(2), // Use Server Total!
    });

    console.log(
      `[Checkout] Created session ${checkoutId} with ${data.items.length} items. DB ID: ${savedSession.id}. Total: $${serverTotalAmount}`,
    );

    // Create Stripe metadata
    // Pass the booking IDs so the webhook can confirm them
    const metadata: Record<string, string> = {
      checkoutId,
      cartId: cart.id,
      type: "cart_checkout",
      itemCount: data.items.length.toString(),
      reservationBookingIds: "[]", // No pre-created bookings
      groupRegistrationIds: "[]", // No pre-created registrations
    };

    // Create PaymentIntent (Embedded Checkout)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(serverTotalAmount * 100), // Amount in cents using Server Total!
      currency: "usd",
      metadata: metadata,
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: primaryEmail,
    });

    if (!paymentIntent.client_secret) {
      return {
        success: false,
        error: "Failed to create payment intent",
      };
    }

    // IMMEDIATELY save the Payment Intent ID to the session
    // This ensures the webhook can find the session by PI ID
    await updateCheckoutSessionPaymentIntent(checkoutId, paymentIntent.id);

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
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
