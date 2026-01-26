import "server-only";

import { db } from "@/db";
import {
  booking,
  NewBooking,
  bookingParticipant,
  NewBookingParticipant,
} from "@/db/schema";
import { eq, and, lt, gt, or } from "drizzle-orm";

// Get ALL bookings (including cancelled/expired) - keeping properly named for clarity if needed elsewhere
export async function getBookingsByType(type: "adult" | "junior") {
  return await db.select().from(booking).where(eq(booking.type, type));
}

// Get only ACTIVE bookings (Confirmed + Valid Holds)
export async function getActiveBookingsByType(type: "adult" | "junior") {
  const now = new Date();
  return await db
    .select()
    .from(booking)
    .where(
      and(
        eq(booking.type, type),
        or(
          eq(booking.status, "confirmed"),
          and(
            eq(booking.status, "pending_payment"),
            gt(booking.expiresAt, now),
          ),
        ),
      ),
    );
}

export async function getAllBookings() {
  return await db.select().from(booking);
}

// NOTE: neon-http driver does not fully support transactions in all modes.
// We use manual consistency handling here.
export async function createBooking(
  data: NewBooking,
  participants: Omit<
    NewBookingParticipant,
    "bookingId" | "id" | "createdAt" | "updatedAt"
  >[],
) {
  // 1. Create the booking record
  const [newBooking] = await db.insert(booking).values(data).returning();

  // 2. If no participants, we are done
  if (participants.length === 0) {
    return newBooking;
  }

  // 3. Try to add participants
  try {
    await db.insert(bookingParticipant).values(
      participants.map((p) => ({
        ...p,
        bookingId: newBooking.id,
      })),
    );
  } catch (error) {
    // 4. If participant insertion fails, ROLLBACK manually
    console.error("Failed to add participants, rolling back booking:", error);
    try {
      await db.delete(booking).where(eq(booking.id, newBooking.id));
    } catch (deleteError) {
      console.error(
        "CRITICAL: Failed to rollback booking after participant failure:",
        deleteError,
      );
    }
    throw error; // Rethrow original error
  }

  return newBooking;
}

export async function checkTimeSlotAvailability(
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string,
) {
  // Find any booking that overlaps with the requested time slot
  // Overlap logic: (StartA < EndB) and (EndA > StartB)

  const overlapRules = [
    lt(booking.startTime, endTime),
    gt(booking.endTime, startTime),
  ];

  // A slot is taken if:
  // 1. Status is "confirmed"
  // 2. OR Status is "pending_payment" AND expiresAt > Now

  const statusRule = or(
    eq(booking.status, "confirmed"),
    and(
      eq(booking.status, "pending_payment"),
      gt(booking.expiresAt, new Date()),
    ),
  );

  const conflictingBookings = await db
    .select()
    .from(booking)
    .where(and(...overlapRules, statusRule));

  return conflictingBookings.length === 0;
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "pending_payment",
  updates: { expiresAt?: Date | null; notes?: string } = {},
) {
  await db
    .update(booking)
    .set({ status, ...updates })
    .where(eq(booking.id, bookingId));
}

export async function getBookingById(id: string) {
  return await db.query.booking.findFirst({
    where: eq(booking.id, id),
    with: {
      participants: true,
    },
  });
}

export async function addBookingParticipants(
  bookingId: string,
  participants: Omit<
    NewBookingParticipant,
    "bookingId" | "id" | "createdAt" | "updatedAt"
  >[],
) {
  if (participants.length === 0) return;

  await db.insert(bookingParticipant).values(
    participants.map((p) => ({
      ...p,
      bookingId,
    })),
  );
}

export async function deleteBooking(id: string) {
  await db.delete(booking).where(eq(booking.id, id));
}
