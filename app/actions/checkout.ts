"use server";

import { cookies } from "next/headers";
import stripe from "@/lib/stripe";
import { getCartWithItems, deleteCart } from "@/db/queries/cart";
import {
  createCheckoutSession,
  updateCheckoutSessionPaymentIntent,
} from "@/db/queries/checkout-sessions";
import { getGiftCardByCode, deductGiftCardBalance } from "@/db/queries/gift-cards";
import { getPromoCodeByCode, incrementPromoCodeUses } from "@/db/queries/promo-codes";

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
  discountCode?: string;
  discountType?: "gift_card" | "promo";
  discountId?: string;
  discountAmount?: number;
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
    const serverTotalAmount = cart.items.reduce((sum, item) => {
      return sum + Number(item.priceAtAdd) * item.quantity;
    }, 0);

    // --------------------------------------------------------
    // SERVER-SIDE DISCOUNT VALIDATION
    // --------------------------------------------------------
    let validatedDiscountAmount = 0;
    let discountMetadata: Record<string, string> = {};

    if (data.discountCode && data.discountType && data.discountId) {
      if (data.discountType === "gift_card") {
        const giftCard = await getGiftCardByCode(data.discountCode);
        if (giftCard && giftCard.isActive && parseFloat(giftCard.currentBalance) > 0) {
          const balance = parseFloat(giftCard.currentBalance);
          validatedDiscountAmount = Math.min(balance, serverTotalAmount);
          discountMetadata = {
            giftCardId: giftCard.id,
            giftCardAmount: validatedDiscountAmount.toFixed(2),
            discountType: "gift_card",
            discountCode: data.discountCode,
          };
        }
      } else if (data.discountType === "promo") {
        const promo = await getPromoCodeByCode(data.discountCode);
        if (promo && promo.isActive) {
          const isWithinLimits = promo.maxUses === null || promo.currentUses < promo.maxUses;
          const isWithinDates =
            (!promo.validFrom || new Date() >= promo.validFrom) &&
            (!promo.validUntil || new Date() <= promo.validUntil);

          if (isWithinLimits && isWithinDates) {
            if (promo.discountType === "percentage") {
              validatedDiscountAmount = Math.min(
                serverTotalAmount,
                (serverTotalAmount * parseFloat(promo.discountValue)) / 100,
              );
            } else {
              validatedDiscountAmount = Math.min(
                serverTotalAmount,
                parseFloat(promo.discountValue),
              );
            }
            discountMetadata = {
              promoCodeId: promo.id,
              promoAmount: validatedDiscountAmount.toFixed(2),
              discountType: "promo",
              discountCode: data.discountCode,
            };
          }
        }
      }
    }

    const chargeAmount = Math.max(0, serverTotalAmount - validatedDiscountAmount);

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
      totalAmount: serverTotalAmount.toFixed(2),
    });

    console.log(
      `[Checkout] Created session ${checkoutId} with ${data.items.length} items. DB ID: ${savedSession.id}. Total: $${serverTotalAmount}. Discount: $${validatedDiscountAmount}. Charge: $${chargeAmount}`,
    );

    // --------------------------------------------------------
    // FULL COVERAGE: Gift card covers entire order
    // --------------------------------------------------------
    if (chargeAmount <= 0 && validatedDiscountAmount > 0) {
      // Deduct gift card balance immediately (no Stripe involved)
      if (data.discountType === "gift_card" && data.discountId) {
        await deductGiftCardBalance(data.discountId, validatedDiscountAmount);
      }
      // Increment promo code uses immediately
      if (data.discountType === "promo" && data.discountId) {
        await incrementPromoCodeUses(data.discountId);
      }

      // Update checkout session as completed
      await updateCheckoutSessionPaymentIntent(checkoutId, `gift_card_full_${checkoutId}`);

      return {
        success: true,
        skipPayment: true,
        checkoutId,
      };
    }

    // Create Stripe metadata
    const metadata: Record<string, string> = {
      checkoutId,
      cartId: cart.id,
      type: "cart_checkout",
      itemCount: data.items.length.toString(),
      reservationBookingIds: "[]",
      groupRegistrationIds: "[]",
      ...discountMetadata,
    };

    // Create PaymentIntent (Embedded Checkout)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(chargeAmount * 100), // Amount in cents — discounted!
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
