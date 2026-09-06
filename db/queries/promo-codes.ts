import "server-only";

import { db } from "@/db";
import { promoCode, promoCodeRedemption } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getPromoCodeByCode(code: string) {
  const result = await db
    .select()
    .from(promoCode)
    .where(eq(promoCode.code, code.toUpperCase()));
  return result[0] || null;
}

export async function incrementPromoCodeUses(id: string) {
  const [updated] = await db
    .update(promoCode)
    .set({
      currentUses: sql`${promoCode.currentUses} + 1`,
    })
    .where(eq(promoCode.id, id))
    .returning();

  return updated;
}

export async function recordPromoCodeRedemption(params: {
  promoCodeId: string;
  promoCode: string;
  checkoutSessionId?: string;
  stripePaymentIntentId?: string;
  customerEmail?: string;
  customerName?: string;
  discountAmount: string;
}) {
  if (params.checkoutSessionId) {
    const [existing] = await db
      .select()
      .from(promoCodeRedemption)
      .where(eq(promoCodeRedemption.checkoutSessionId, params.checkoutSessionId))
      .limit(1);

    if (existing) return existing;
  }

  const [created] = await db
    .insert(promoCodeRedemption)
    .values({
      promoCodeId: params.promoCodeId,
      promoCode: params.promoCode.toUpperCase(),
      checkoutSessionId: params.checkoutSessionId,
      stripePaymentIntentId: params.stripePaymentIntentId,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      discountAmount: params.discountAmount,
    })
    .returning();

  await incrementPromoCodeUses(params.promoCodeId);
  return created;
}

export async function getAllPromoCodes() {
  return await db
    .select()
    .from(promoCode)
    .orderBy(sql`${promoCode.createdAt} DESC`);
}
