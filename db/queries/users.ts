import { db } from '@/db/index';
import { regularUser } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get a regular user by email address
 */
export async function getRegularUserByEmail(email: string) {
  const users = await db
    .select()
    .from(regularUser)
    .where(eq(regularUser.email, email))
    .limit(1);

  return users[0] || null;
}

/**
 * Create a new regular user
 */
export async function createRegularUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}) {
  const result = await db
    .insert(regularUser)
    .values(data)
    .returning();

  return result[0];
}

/**
 * Get or create a regular user by email
 * Returns existing user if found, creates new one if not
 */
export async function getOrCreateRegularUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}) {
  const existingUser = await getRegularUserByEmail(data.email);

  if (existingUser) {
    return existingUser;
  }

  return await createRegularUser(data);
}

/**
 * Get regular user by ID
 */
export async function getRegularUserById(id: string) {
  const users = await db
    .select()
    .from(regularUser)
    .where(eq(regularUser.id, id))
    .limit(1);

  return users[0] || null;
}

/**
 * Update regular user's Stripe customer ID
 */
export async function updateRegularUserStripeCustomerId(
  userId: string,
  stripeCustomerId: string
) {
  const result = await db
    .update(regularUser)
    .set({ updatedAt: new Date() })
    .where(eq(regularUser.id, userId))
    .returning();

  return result[0];
}

