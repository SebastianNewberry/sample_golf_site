import "server-only";

import { db } from "@/db";
import { giftCard, giftCardTransaction } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

/**
 * Generate a 12-character alphanumeric gift card code
 * Uses charset that excludes confusable characters: 0/O, 1/I
 */
const GIFT_CARD_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateGiftCardCode(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => GIFT_CARD_CHARSET[b % GIFT_CARD_CHARSET.length])
    .join("");
}

export async function createGiftCard(data: {
  code: string;
  initialAmount: string;
  purchaserEmail: string;
  purchaserName: string;
  recipientEmail?: string;
  stripePaymentIntentId?: string;
}) {
  const [card] = await db
    .insert(giftCard)
    .values({
      code: data.code,
      initialAmount: data.initialAmount,
      currentBalance: data.initialAmount,
      purchaserEmail: data.purchaserEmail,
      purchaserName: data.purchaserName,
      recipientEmail: data.recipientEmail || null,
      stripePaymentIntentId: data.stripePaymentIntentId || null,
      status: "pending",
      isActive: false,
    })
    .returning();

  return card;
}

export async function getGiftCardByCode(code: string) {
  const result = await db
    .select()
    .from(giftCard)
    .where(eq(giftCard.code, code.toUpperCase()));
  return result[0] || null;
}

export async function getGiftCardById(id: string) {
  const result = await db.select().from(giftCard).where(eq(giftCard.id, id));
  return result[0] || null;
}

export async function activateGiftCard(id: string) {
  const [updated] = await db
    .update(giftCard)
    .set({
      status: "active",
      isActive: true,
    })
    .where(eq(giftCard.id, id))
    .returning();

  return updated;
}

export async function applyGiftCardRedemption(params: {
  giftCardId: string;
  amount: number;
  checkoutSessionId?: string;
  stripePaymentIntentId?: string;
  customerEmail?: string;
  customerName?: string;
}) {
  return await db.transaction(async (tx) => {
    if (params.checkoutSessionId) {
      const [existing] = await tx
        .select()
        .from(giftCardTransaction)
        .where(
          and(
            eq(giftCardTransaction.giftCardId, params.giftCardId),
            eq(giftCardTransaction.checkoutSessionId, params.checkoutSessionId),
          ),
        )
        .limit(1);

      if (existing) return existing;
    }

    const [card] = await tx
      .select()
      .from(giftCard)
      .where(eq(giftCard.id, params.giftCardId))
      .for("update");

    if (!card) throw new Error(`Gift card ${params.giftCardId} not found`);

    const currentBalance = parseFloat(card.currentBalance);
    const deduction = Math.min(params.amount, currentBalance);
    const newBalance = Math.max(0, currentBalance - deduction);

    await tx
      .update(giftCard)
      .set({
        currentBalance: newBalance.toFixed(2),
        status: newBalance <= 0 ? "depleted" : "active",
      })
      .where(eq(giftCard.id, params.giftCardId));

    const [created] = await tx
      .insert(giftCardTransaction)
      .values({
        giftCardId: params.giftCardId,
        type: "redemption",
        amount: deduction.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        checkoutSessionId: params.checkoutSessionId,
        stripePaymentIntentId: params.stripePaymentIntentId,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
      })
      .returning();

    return created;
  });
}

export async function deductGiftCardBalance(id: string, amount: number) {
  return applyGiftCardRedemption({ giftCardId: id, amount });
}

export async function getAllGiftCards() {
  return await db
    .select()
    .from(giftCard)
    .orderBy(sql`${giftCard.createdAt} DESC`);
}
