import 'server-only';

import { db } from "@/db";
import { contactSubmission } from "@/db/schema";
import type { NewContactSubmission } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Insert a new contact submission into the database
 */
export async function insertContactSubmission(data: NewContactSubmission) {
  const [result] = await db.insert(contactSubmission).values(data).returning();
  return result;
}

/**
 * Get all contact submissions (for admin view)
 */
export async function getAllContactSubmissions() {
  return await db
    .select()
    .from(contactSubmission)
    .orderBy(contactSubmission.createdAt);
}

/**
 * Get contact submission by ID
 */
export async function getContactSubmissionById(id: string) {
  const [result] = await db
    .select()
    .from(contactSubmission)
    .where(eq(contactSubmission.id, id));
  return result;
}
