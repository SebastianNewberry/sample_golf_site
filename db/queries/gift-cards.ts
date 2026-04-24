import "server-only";

import { db } from "@/db";
import { giftCard } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

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

/**
 * Create a new gift card (pending status - activated via webhook after payment)
 */
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

/**
 * Look up a gift card by its 12-character code
 */
export async function getGiftCardByCode(code: string) {
  const result = await db
    .select()
    .from(giftCard)
    .where(eq(giftCard.code, code.toUpperCase()));
  return result[0] || null;
}

/**
 * Get a gift card by ID
 */
export async function getGiftCardById(id: string) {
  const result = await db
    .select()
    .from(giftCard)
    .where(eq(giftCard.id, id));
  return result[0] || null;
}

/**
 * Activate a gift card after payment is confirmed (called from webhook)
 */
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

/**
 * Deduct an amount from a gift card's balance
 * Sets status to 'depleted' if balance reaches 0
 */
export async function deductGiftCardBalance(id: string, amount: number) {
  const card = await getGiftCardById(id);
  if (!card) throw new Error(`Gift card ${id} not found`);

  const currentBalance = parseFloat(card.currentBalance);
  const deduction = Math.min(amount, currentBalance);
  const newBalance = Math.max(0, currentBalance - deduction);

  const [updated] = await db
    .update(giftCard)
    .set({
      currentBalance: newBalance.toFixed(2),
      status: newBalance <= 0 ? "depleted" : "active",
    })
    .where(eq(giftCard.id, id))
    .returning();

  return updated;
}

/**
 * Get all gift cards (for admin views)
 */
export async function getAllGiftCards() {
  return await db
    .select()
    .from(giftCard)
    .orderBy(sql`${giftCard.createdAt} DESC`);
}
