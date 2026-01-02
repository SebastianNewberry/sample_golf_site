import { db } from '@/db/index';
import { adultRegistration } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Create a new adult registration
 * Now includes payment fields for proper tracking
 */
export async function createAdultRegistration(data: {
  userId: string;
  programId: string;
  programSessionId?: string;
  additionalComments?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentAmount?: string;
}) {
  const result = await db
    .insert(adultRegistration)
    .values({
      userId: data.userId,
      programId: data.programId,
      programSessionId: data.programSessionId,
      additionalComments: data.additionalComments,
      stripePaymentIntentId: data.stripePaymentIntentId,
      stripeCustomerId: data.stripeCustomerId,
      paymentStatus: data.paymentStatus || 'pending',
      paymentAmount: data.paymentAmount,
    })
    .returning();

  return result[0];
}

/**
 * Update an adult registration with payment intent ID
 * Called immediately after creating payment intent
 */
export async function updateAdultRegistrationPaymentIntent(
  registrationId: string,
  paymentIntentId: string
) {
  const result = await db
    .update(adultRegistration)
    .set({
      stripePaymentIntentId: paymentIntentId,
      updatedAt: new Date(),
    })
    .where(eq(adultRegistration.id, registrationId))
    .returning();

  return result[0];
}

/**
 * Get adult registration by ID
 */
export async function getAdultRegistrationById(id: string) {
  const registrations = await db
    .select()
    .from(adultRegistration)
    .where(eq(adultRegistration.id, id))
    .limit(1);

  return registrations[0] || null;
}

/**
 * Get adult registrations by user ID
 */
export async function getAdultRegistrationsByUserId(userId: string) {
  return await db
    .select()
    .from(adultRegistration)
    .where(eq(adultRegistration.userId, userId));
}

/**
 * Get adult registration by payment intent ID
 */
export async function getAdultRegistrationByPaymentIntentId(
  paymentIntentId: string
) {
  const registrations = await db
    .select()
    .from(adultRegistration)
    .where(eq(adultRegistration.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  return registrations[0] || null;
}

/**
 * Update payment status for adult registration
 */
export async function updateAdultRegistrationPaymentStatus(
  registrationId: string,
  data: {
    stripePaymentIntentId?: string;
    stripeCustomerId?: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
    paymentAmount?: string;
  }
) {
  const result = await db
    .update(adultRegistration)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(adultRegistration.id, registrationId))
    .returning();

  return result[0];
}

