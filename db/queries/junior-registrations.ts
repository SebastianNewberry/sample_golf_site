import { db } from '@/db/index';
import { juniorRegistration, juniorProgramRegistration } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

/**
 * Create a new junior registration
 */
export async function createJuniorRegistration(data: {
  userId: string;
  phoneType: string;
  preferredContactMethod: string;
  childFirstName: string;
  childLastName: string;
  childAge: number;
  childExperienceLevel: string;
  hasOwnClubs: boolean;
  friendsToGroupWith?: string;
  additionalComments?: string;
}) {
  const result = await db
    .insert(juniorRegistration)
    .values(data)
    .returning();

  return result[0];
}

/**
 * Get junior registration by ID
 */
export async function getJuniorRegistrationById(id: string) {
  const registrations = await db
    .select()
    .from(juniorRegistration)
    .where(eq(juniorRegistration.id, id))
    .limit(1);

  return registrations[0] || null;
}

/**
 * Link a junior registration to a program and optional session
 * Now includes payment fields for proper tracking
 */
export async function createJuniorProgramRegistration(data: {
  juniorRegistrationId: string;
  programId: string;
  programSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentAmount?: string;
}) {
  const result = await db
    .insert(juniorProgramRegistration)
    .values({
      juniorRegistrationId: data.juniorRegistrationId,
      programId: data.programId,
      programSessionId: data.programSessionId,
      stripePaymentIntentId: data.stripePaymentIntentId,
      stripeCustomerId: data.stripeCustomerId,
      paymentStatus: data.paymentStatus || 'pending',
      paymentAmount: data.paymentAmount,
    })
    .returning();

  return result[0];
}

/**
 * Get junior program registration by ID
 */
export async function getJuniorProgramRegistrationById(id: string) {
  const registrations = await db
    .select()
    .from(juniorProgramRegistration)
    .where(eq(juniorProgramRegistration.id, id))
    .limit(1);

  return registrations[0] || null;
}

/**
 * Get junior registrations by user ID
 */
export async function getJuniorRegistrationsByUserId(userId: string) {
  return await db
    .select()
    .from(juniorRegistration)
    .where(eq(juniorRegistration.userId, userId));
}

/**
 * Get junior program registration by payment intent ID
 */
export async function getJuniorProgramRegistrationByPaymentIntentId(
  paymentIntentId: string
) {
  const registrations = await db
    .select()
    .from(juniorProgramRegistration)
    .where(eq(juniorProgramRegistration.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  return registrations[0] || null;
}

/**
 * Update payment status for junior program registration
 */
export async function updateJuniorProgramRegistrationPaymentStatus(
  registrationId: string,
  data: {
    stripePaymentIntentId?: string;
    stripeCustomerId?: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
    paymentAmount?: string;
  }
) {
  const result = await db
    .update(juniorProgramRegistration)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(juniorProgramRegistration.id, registrationId))
    .returning();

  return result[0];
}

/**
 * Update junior program registration with payment intent ID
 * Called immediately after creating payment intent
 */
export async function updateJuniorProgramRegistrationPaymentIntent(
  registrationId: string,
  paymentIntentId: string
) {
  const result = await db
    .update(juniorProgramRegistration)
    .set({
      stripePaymentIntentId: paymentIntentId,
      updatedAt: new Date(),
    })
    .where(eq(juniorProgramRegistration.id, registrationId))
    .returning();

  return result[0];
}

/**
 * Get or create junior program registration
 * Uses upsert pattern to prevent duplicates from webhook race conditions
 */
export async function getOrCreateJuniorProgramRegistration(data: {
  juniorRegistrationId: string;
  programId: string;
  programSessionId?: string;
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentAmount?: string;
}) {
  // First, try to find existing registration by payment intent ID
  const existing = await getJuniorProgramRegistrationByPaymentIntentId(data.stripePaymentIntentId);
  
  if (existing) {
    // Update existing registration with payment info
    return await updateJuniorProgramRegistrationPaymentStatus(existing.id, {
      stripePaymentIntentId: data.stripePaymentIntentId,
      stripeCustomerId: data.stripeCustomerId,
      paymentStatus: data.paymentStatus || 'pending',
      paymentAmount: data.paymentAmount,
    });
  }

  // Check if there's a pending registration for this junior + program combo
  const pendingRegistrations = await db
    .select()
    .from(juniorProgramRegistration)
    .where(
      and(
        eq(juniorProgramRegistration.juniorRegistrationId, data.juniorRegistrationId),
        eq(juniorProgramRegistration.programId, data.programId),
        eq(juniorProgramRegistration.paymentStatus, 'pending')
      )
    )
    .limit(1);

  if (pendingRegistrations.length > 0) {
    // Update the pending registration with payment info
    return await updateJuniorProgramRegistrationPaymentStatus(pendingRegistrations[0].id, {
      stripePaymentIntentId: data.stripePaymentIntentId,
      stripeCustomerId: data.stripeCustomerId,
      paymentStatus: data.paymentStatus || 'pending',
      paymentAmount: data.paymentAmount,
    });
  }

  // Create new registration with all payment fields
  return await createJuniorProgramRegistration(data);
}

