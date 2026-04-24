import "server-only";

import { db } from "@/db";
import { promoCode } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Look up a promo code by its code string
 */
export async function getPromoCodeByCode(code: string) {
  const result = await db
    .select()
    .from(promoCode)
    .where(eq(promoCode.code, code.toUpperCase()));
  return result[0] || null;
}

/**
 * Increment the usage counter for a promo code (called from webhook)
 */
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

/**
 * Get all promo codes (for admin views)
 */
export async function getAllPromoCodes() {
  return await db
    .select()
    .from(promoCode)
    .orderBy(sql`${promoCode.createdAt} DESC`);
}
