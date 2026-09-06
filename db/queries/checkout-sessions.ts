import "server-only";

import { db } from "@/db/index";
import { checkoutSession } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface CheckoutOrderSummary {
  subtotalAmount: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  taxInclusive: boolean;
  discountLabel?: string;
}

interface CheckoutFormData {
  items: {
    cartItemId: string;
    programId: string;
    programSessionId?: string;
    registrationType: "adult" | "junior";
    formData: Record<string, unknown>;
    metadata?: string;
    priceAtAdd?: string;
  }[];
  orderSummary?: CheckoutOrderSummary;
}

/**
 * Create a new checkout session
 */
export async function createCheckoutSession(data: {
  checkoutId: string;
  cartId: string;
  stripePaymentIntentId?: string;
  formData: CheckoutFormData;
  totalAmount: string;
  taxAmount?: string;
  subtotalAmount?: string;
  discountAmount?: string;
  taxInclusive?: boolean;
  promoCodeId?: string;
  giftCardId?: string;
  customerEmail?: string;
  customerName?: string;
}) {
  const result = await db
    .insert(checkoutSession)
    .values({
      checkoutId: data.checkoutId,
      cartId: data.cartId,
      stripePaymentIntentId: data.stripePaymentIntentId,
      formData: JSON.stringify(data.formData),
      totalAmount: data.totalAmount,
      taxAmount: data.taxAmount ?? "0",
      subtotalAmount: data.subtotalAmount ?? "0",
      discountAmount: data.discountAmount ?? "0",
      taxInclusive: data.taxInclusive ?? true,
      promoCodeId: data.promoCodeId,
      giftCardId: data.giftCardId,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
    })
    .returning();

  return result[0];
}

/**
 * Get checkout session by checkout ID
 */
export async function getCheckoutSessionByCheckoutId(checkoutId: string) {
  const sessions = await db
    .select()
    .from(checkoutSession)
    .where(eq(checkoutSession.checkoutId, checkoutId))
    .limit(1);

  if (sessions.length === 0) {
    return null;
  }

  const session = sessions[0];
  return {
    ...session,
    formData: JSON.parse(session.formData) as CheckoutFormData,
  };
}

/**
 * Get checkout session by payment intent ID
 */
export async function getCheckoutSessionByPaymentIntentId(
  paymentIntentId: string,
) {
  const sessions = await db
    .select()
    .from(checkoutSession)
    .where(eq(checkoutSession.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (sessions.length === 0) {
    return null;
  }

  const session = sessions[0];
  return {
    ...session,
    formData: JSON.parse(session.formData) as CheckoutFormData,
  };
}

/**
 * Update checkout session with payment intent ID
 */
export async function updateCheckoutSessionPaymentIntent(
  checkoutId: string,
  paymentIntentId: string,
) {
  const result = await db
    .update(checkoutSession)
    .set({
      stripePaymentIntentId: paymentIntentId,
    })
    .where(eq(checkoutSession.checkoutId, checkoutId))
    .returning();

  return result[0];
}

/**
 * Mark checkout session as completed
 */
export async function completeCheckoutSession(checkoutId: string) {
  const result = await db
    .update(checkoutSession)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(checkoutSession.checkoutId, checkoutId))
    .returning();

  return result[0];
}

/**
 * Delete expired checkout sessions
 */
export async function cleanupExpiredCheckoutSessions() {
  // This would be called by a cron job
  // For now, just a placeholder
  console.log("Cleanup expired checkout sessions called");
}
