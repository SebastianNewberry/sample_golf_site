"use server";

import stripe from "@/lib/stripe";
import {
  createGiftCard,
  generateGiftCardCode,
  getGiftCardByCode,
  getGiftCardById,
} from "@/db/queries/gift-cards";
import { getPromoCodeByCode } from "@/db/queries/promo-codes";

/**
 * Purchase a gift card — creates a pending record and Stripe PaymentIntent
 */
export async function purchaseGiftCard(data: {
  amount: number;
  purchaserName: string;
  purchaserEmail: string;
  recipientEmail?: string;
}) {
  const { amount, purchaserName, purchaserEmail, recipientEmail } = data;

  // Validate amount
  if (amount < 10 || amount > 1000) {
    return { error: "Gift card amount must be between $10 and $1,000" };
  }

  // Generate unique 12-character code
  let code = generateGiftCardCode();

  // Ensure uniqueness (very unlikely collision but be safe)
  let existing = await getGiftCardByCode(code);
  let attempts = 0;
  while (existing && attempts < 5) {
    code = generateGiftCardCode();
    existing = await getGiftCardByCode(code);
    attempts++;
  }

  if (existing) {
    return { error: "Failed to generate unique gift card code. Please try again." };
  }

  // Create gift card record (pending until payment confirmed)
  const giftCard = await createGiftCard({
    code,
    initialAmount: amount.toFixed(2),
    purchaserEmail,
    purchaserName,
    recipientEmail: recipientEmail || undefined,
  });

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe uses cents
    currency: "usd",
    metadata: {
      type: "gift_card_purchase",
      giftCardId: giftCard.id,
      giftCardCode: code,
      purchaserEmail,
      purchaserName,
      recipientEmail: recipientEmail || "",
      amount: amount.toFixed(2),
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    code,
    giftCardId: giftCard.id,
  };
}

/**
 * Validate a discount code — could be a gift card or promo code
 * Returns info for display in the checkout UI (does NOT deduct anything)
 */
export async function validateDiscountCode(code: string) {
  const normalizedCode = code.toUpperCase().trim().replace(/-/g, "");

  if (!normalizedCode) {
    return { valid: false, error: "Please enter a code" };
  }

  // Check gift cards first (12-char alphanumeric)
  const giftCardResult = await getGiftCardByCode(normalizedCode);
  if (giftCardResult) {
    if (!giftCardResult.isActive) {
      return { valid: false, error: "This gift card has not been activated yet" };
    }
    if (giftCardResult.status === "depleted") {
      return { valid: false, error: "This gift card has no remaining balance" };
    }
    if (giftCardResult.status === "cancelled") {
      return { valid: false, error: "This gift card has been cancelled" };
    }

    const balance = parseFloat(giftCardResult.currentBalance);
    if (balance <= 0) {
      return { valid: false, error: "This gift card has no remaining balance" };
    }

    return {
      valid: true,
      type: "gift_card" as const,
      discountId: giftCardResult.id,
      code: giftCardResult.code,
      balance,
      discountType: "fixed" as const,
      discountValue: balance,
    };
  }

  // Check promo codes
  const promoCodeResult = await getPromoCodeByCode(normalizedCode);
  if (promoCodeResult) {
    if (!promoCodeResult.isActive) {
      return { valid: false, error: "This promo code is no longer active" };
    }

    // Check usage limits
    if (
      promoCodeResult.maxUses !== null &&
      promoCodeResult.currentUses >= promoCodeResult.maxUses
    ) {
      return { valid: false, error: "This promo code has reached its usage limit" };
    }

    // Check date validity
    const now = new Date();
    if (promoCodeResult.validFrom && now < promoCodeResult.validFrom) {
      return { valid: false, error: "This promo code is not yet valid" };
    }
    if (promoCodeResult.validUntil && now > promoCodeResult.validUntil) {
      return { valid: false, error: "This promo code has expired" };
    }

    return {
      valid: true,
      type: "promo" as const,
      discountId: promoCodeResult.id,
      code: promoCodeResult.code,
      discountType: promoCodeResult.discountType as "percentage" | "fixed",
      discountValue: parseFloat(promoCodeResult.discountValue),
    };
  }

  return { valid: false, error: "Invalid code. Please check and try again." };
}
