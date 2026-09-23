import "server-only";

import {
  extractBookedSessions,
  filterAvailableSlots,
  toESTTimeString,
  type RawSlot,
} from "@/lib/availability";
import { getActiveBookingsByType } from "@/db/queries/bookings";
import {
  getInstructorAvailability,
  getProgramSessions,
} from "@/db/queries/programs";

const PRIVATE_PROGRAM_IDS = {
  adult: "f89b62ee-ffda-421d-a525-8bd2a580f24e",
  junior: "754bf4be-0ef6-4123-b5ff-b107e03c2f10",
} as const;

export type PrivateInstructionAudience = keyof typeof PRIVATE_PROGRAM_IDS;

/** Open lesson times for one private-instruction page. Not part of the shared program catalog. */
export async function getPrivateInstructionSlots(
  type: PrivateInstructionAudience,
) {
  const programId = PRIVATE_PROGRAM_IDS[type];
  const [realBookings, availabilityData, sessions] = await Promise.all([
    getActiveBookingsByType(type),
    getInstructorAvailability(type),
    getProgramSessions(programId),
  ]);

  const bookedSessions = [
    ...extractBookedSessions(sessions),
    ...realBookings.map((booking) => ({
      date: booking.startTime,
      startTime: toESTTimeString(booking.startTime),
      endTime: toESTTimeString(booking.endTime),
    })),
  ];

  const rawSlots: RawSlot[] = availabilityData.flatMap((entry) => {
    if (!Array.isArray(entry.schedule)) return [];
    return entry.schedule.flatMap((slot) => {
      if (typeof slot !== "object" || slot === null) return [];
      const record = slot as Record<string, unknown>;
      if (
        typeof record.date !== "string" ||
        typeof record.startTime !== "string" ||
        typeof record.endTime !== "string"
      ) {
        return [];
      }
      return [
        {
          date: record.date,
          startTime: record.startTime,
          endTime: record.endTime,
        },
      ];
    });
  });

  return filterAvailableSlots(rawSlots, bookedSessions);
}
