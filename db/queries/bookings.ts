import "server-only";

import { db } from "@/db";
import {
  booking,
  NewBooking,
  adultRegistration,
  juniorRegistration,
  NewAdultRegistration,
  NewJuniorRegistration,
} from "@/db/schema";
import { eq, and, lt, gt, or, not, like } from "drizzle-orm";

// Get ALL bookings (including cancelled/expired)
export async function getBookingsByType(type: "adult" | "junior") {
  return await db.select().from(booking).where(eq(booking.type, type));
}

// Get only ACTIVE bookings (Confirmed + Valid Holds)
export async function getActiveBookingsByType(type: "adult" | "junior") {
  return await db.select().from(booking).where(eq(booking.status, "confirmed"));
}

export async function getAllBookings() {
  return await db.select().from(booking);
}

// NOTE: neon-http driver does not fully support transactions in all modes.
// We use manual consistency handling here.
export async function createBooking(
  data: NewBooking,
  participants: any[], // Type loose here as we handle specific tables inside
) {
  // 1. Create the booking record
  const [newBooking] = await db.insert(booking).values(data).returning();

  // 2. If no participants, we are done
  if (participants.length === 0) {
    return newBooking;
  }

  // 3. Try to add participants
  try {
    const type = data.type;

    if (type === 'adult') {
      const adultParticipants = participants.map(p => ({
        bookingId: newBooking.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phoneNumber: p.phoneNumber,
        phoneType: p.phoneType || null,
        preferredContactMethod: p.preferredContactMethod || null,
        hasOwnClubs: p.hasOwnClubs || false,
        additionalComments: p.additionalComments || null,
        userId: data.userId || p.userId, // fallback
      }));

      const validAdults = adultParticipants.map(p => ({
        ...p,
        userId: p.userId || newBooking.userId, // Use booking owner if no specific user
      })).filter(p => p.userId);

      if (validAdults.length > 0) {
        await db.insert(adultRegistration).values(validAdults as any);
      }
    } else {
      const juniorParticipants = participants.map(p => ({
        bookingId: newBooking.id,
        // Junior fields
        primaryContactFirstName: p.primaryContactFirstName,
        primaryContactLastName: p.primaryContactLastName,
        primaryContactEmail: p.primaryContactEmail,
        primaryContactPhone: p.primaryContactPhone,
        childFirstName: p.childFirstName,
        childLastName: p.childLastName,
        childAge: p.childAge,
        childExperienceLevel: p.childExperienceLevel,
        phoneType: p.phoneType,
        preferredContactMethod: p.preferredContactMethod,
        hasOwnClubs: p.hasOwnClubs,
        friendsToGroupWith: p.friendsToGroupWith || null,
        additionalComments: p.additionalComments || null,
        userId: data.userId || p.userId,
      }));

      const validJuniors = juniorParticipants.map(p => ({
        ...p,
        userId: p.userId || newBooking.userId,
      })).filter(p => p.userId);

      if (validJuniors.length > 0) {
        await db.insert(juniorRegistration).values(validJuniors as any);
      }
    }

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
  excludeCheckoutId?: string,
) {
  // Find any booking that overlaps with the requested time slot
  // Overlap logic: (StartA < EndB) and (EndA > StartB)

  const overlapRules = [
    lt(booking.startTime, endTime),
    gt(booking.endTime, startTime),
  ];

  // A slot is taken if:
  // 1. Status is "confirmed"
  const statusRule = eq(booking.status, "confirmed");

  const conflictingBookings = await db
    .select()
    .from(booking)
    .where(and(...overlapRules, statusRule));

  if (conflictingBookings.length === 0) {
    return { available: true };
  }

  const hasConfirmed = conflictingBookings.some(
    (b) => b.status === "confirmed",
  );
  return {
    available: false,
    reason: hasConfirmed ? "fully_booked" : "hold_active",
  };
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "pending_payment",
  updates: { notes?: string } = {},
) {
  await db
    .update(booking)
    .set({ status, ...updates })
    .where(eq(booking.id, bookingId));
}

export async function updateBooking(
  id: string,
  data: Partial<typeof booking.$inferInsert>,
) {
  return await db
    .update(booking)
    .set(data)
    .where(eq(booking.id, id));
}

export async function getBookingById(id: string) {
  return await db.query.booking.findFirst({
    where: eq(booking.id, id),
    with: {
      adultRegistrations: true,
      juniorRegistrations: true,
    },
  });
}

export async function addBookingParticipants(
  bookingId: string,
  participants: any[],
) {
  if (participants.length === 0) return;

  // We need to know the type for sure.
  // Assuming callers might pass mixed array or we check first element?
  // But safest is to key off 'type' prop if present.

  const adults = participants.filter(p => p.type === 'adult').map(p => ({
    bookingId,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    phoneNumber: p.phoneNumber,
    phoneType: p.phoneType || null,
    preferredContactMethod: p.preferredContactMethod || null,
    hasOwnClubs: p.hasOwnClubs || false,
    additionalComments: p.additionalComments || null,
    userId: p.userId,
  })).filter(p => p.userId); // userId required

  const juniors = participants.filter(p => p.type === 'junior').map(p => ({
    bookingId,
    // Junior fields
    primaryContactFirstName: p.primaryContactFirstName,
    primaryContactLastName: p.primaryContactLastName,
    primaryContactEmail: p.primaryContactEmail,
    primaryContactPhone: p.primaryContactPhone,
    childFirstName: p.childFirstName,
    childLastName: p.childLastName,
    childAge: p.childAge,
    childExperienceLevel: p.childExperienceLevel,
    phoneType: p.phoneType,
    preferredContactMethod: p.preferredContactMethod,
    hasOwnClubs: p.hasOwnClubs,
    friendsToGroupWith: p.friendsToGroupWith || null,
    additionalComments: p.additionalComments || null,
    userId: p.userId,
  })).filter(p => p.userId);

  if (adults.length > 0) {
    await db.insert(adultRegistration).values(adults as any);
  }

  if (juniors.length > 0) {
    await db.insert(juniorRegistration).values(juniors as any);
  }
}

export async function deleteBooking(id: string) {
  await db.delete(booking).where(eq(booking.id, id));
}
