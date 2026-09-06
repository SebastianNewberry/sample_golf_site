"use server";

import { cookies } from "next/headers";
import stripe from "@/lib/stripe";
import { getCartWithItems, deleteCart } from "@/db/queries/cart";
import {
  createCheckoutSession,
  updateCheckoutSessionPaymentIntent,
  completeCheckoutSession,
} from "@/db/queries/checkout-sessions";
import {
  getGiftCardByCode,
  applyGiftCardRedemption,
} from "@/db/queries/gift-cards";
import {
  getPromoCodeByCode,
  recordPromoCodeRedemption,
} from "@/db/queries/promo-codes";

const CART_SESSION_COOKIE = "cart_session_id";

import { validateCartAvailability } from "@/app/actions/validation";
import { cartItemLineTotal } from "@/lib/pricing-options";
import { calculateSalesTax } from "@/lib/tax";

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
    const availability = await validateCartAvailability(cart.items);
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

    // Re-fetch cart after price reconciliation during validation
    const refreshedCart = await getCartWithItems(sessionId);
    if (!refreshedCart) {
      return { success: false, error: "Cart not found" };
    }

    // --------------------------------------------------------
    // STRICT TOTAL CALCULATION
    // --------------------------------------------------------
    const serverTotalAmount = refreshedCart.items.reduce((sum, item) => {
      return sum + cartItemLineTotal(item);
    }, 0);

    const primaryEmail = getPrimaryEmail(data.items[0]);
    const primaryName = getPrimaryName(data.items[0]);
    const checkoutId = crypto.randomUUID();

    // --------------------------------------------------------
    // SERVER-SIDE DISCOUNT VALIDATION
    // --------------------------------------------------------
    let validatedDiscountAmount = 0;
    let discountMetadata: Record<string, string> = {};

    if (data.discountCode && data.discountType && data.discountId) {
      if (data.discountType === "gift_card") {
        const giftCard = await getGiftCardByCode(data.discountCode);
        if (
          giftCard &&
          giftCard.isActive &&
          parseFloat(giftCard.currentBalance) > 0
        ) {
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
          const isWithinLimits =
            promo.maxUses === null || promo.currentUses < promo.maxUses;
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

    const listedAfterDiscount = Math.max(
      0,
      serverTotalAmount - validatedDiscountAmount,
    );

    const taxResult = await calculateSalesTax({
      amountCents: Math.round(listedAfterDiscount * 100),
      reference: checkoutId,
    });
    const taxAmount = taxResult.taxCents / 100;
    const chargeAmount = taxResult.totalCents / 100;

    const discountLabel =
      validatedDiscountAmount > 0
        ? data.discountType === "gift_card"
          ? `Gift Card (${data.discountCode?.slice(0, 4)}...)`
          : `Promo (${data.discountCode})`
        : undefined;

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
              refreshedCart.items.find((ci) => ci.id === item.cartItemId)
                ?.metadata || undefined,
            priceAtAdd:
              refreshedCart.items.find((ci) => ci.id === item.cartItemId)
                ?.priceAtAdd || "0",
          };
        }),
        orderSummary: {
          subtotalAmount: serverTotalAmount.toFixed(2),
          discountAmount: validatedDiscountAmount.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          totalAmount: chargeAmount.toFixed(2),
          taxInclusive: taxResult.inclusive,
          ...(discountLabel ? { discountLabel } : {}),
        },
      },
      totalAmount: chargeAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      subtotalAmount: serverTotalAmount.toFixed(2),
      discountAmount: validatedDiscountAmount.toFixed(2),
      taxInclusive: taxResult.inclusive,
      promoCodeId:
        data.discountType === "promo" ? data.discountId : undefined,
      giftCardId:
        data.discountType === "gift_card" ? data.discountId : undefined,
      customerEmail: primaryEmail,
      customerName: primaryName,
    });

    console.log(
      `[Checkout] Created session ${checkoutId} with ${data.items.length} items. DB ID: ${savedSession.id}. Listed: $${serverTotalAmount}. Discount: $${validatedDiscountAmount}. Tax: $${taxAmount}. Charge: $${chargeAmount}. Inclusive: ${taxResult.inclusive}`,
    );

    // --------------------------------------------------------
    // FULL COVERAGE: Gift card covers entire order
    // --------------------------------------------------------
    if (chargeAmount <= 0 && validatedDiscountAmount > 0) {
      if (data.discountType === "gift_card" && data.discountId) {
        await applyGiftCardRedemption({
          giftCardId: data.discountId,
          amount: validatedDiscountAmount,
          checkoutSessionId: savedSession.id,
          stripePaymentIntentId: `gift_card_full_${checkoutId}`,
          customerEmail: primaryEmail,
          customerName: primaryName,
        });
      }
      if (data.discountType === "promo" && data.discountId) {
        await recordPromoCodeRedemption({
          promoCodeId: data.discountId,
          promoCode: data.discountCode || data.discountId,
          checkoutSessionId: savedSession.id,
          stripePaymentIntentId: `gift_card_full_${checkoutId}`,
          customerEmail: primaryEmail,
          customerName: primaryName,
          discountAmount: validatedDiscountAmount.toFixed(2),
        });
      }

      await updateCheckoutSessionPaymentIntent(
        checkoutId,
        `gift_card_full_${checkoutId}`,
      );
      await completeCheckoutSession(checkoutId);

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
      taxAmount: taxAmount.toFixed(2),
      taxInclusive: taxResult.inclusive ? "true" : "false",
      ...(taxResult.calculationId
        ? { taxCalculationId: taxResult.calculationId }
        : {}),
      ...discountMetadata,
    };

    // Create PaymentIntent (Embedded Checkout)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: taxResult.totalCents,
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

function getPrimaryName(item: CheckoutItem): string {
  if (item.registrationType === "adult") {
    const data = item.formData as AdultFormData;
    return `${data.firstName} ${data.lastName}`.trim();
  }
  const data = item.formData as JuniorFormData;
  return `${data.primaryContactFirstName} ${data.primaryContactLastName}`.trim();
}

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
