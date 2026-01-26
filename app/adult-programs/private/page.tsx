import {
  getInstructorAvailability,
  getProgramById,
  getProgramSessions,
} from "@/db/queries/programs";
import {
  ProgramDetailsSection,
  DEFAULT_ADULT_PROGRAM_DETAILS,
} from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import type { ProgramDetail } from "@/lib/program-details";
import type { ProgramSession } from "@/db/schema";
import { AdultPrivateGolfInstructionClient } from "./AdultPrivateGolfInstructionClient";
import {
  filterAvailableSlots,
  extractBookedSessions,
  toESTTimeString,
} from "@/lib/availability";
import { getActiveBookingsByType } from "@/db/queries/bookings";
import { addDays } from "date-fns";

export default async function AdultPrivateGolfInstruction() {
  const program = await getProgramById("f89b62ee-ffda-421d-a525-8bd2a580f24e");
  const sessions = program ? await getProgramSessions(program.id) : [];

  // Parse existing sessions into BookedSession format (from program_session table - likely empty for private)
  const programSessionBookings = extractBookedSessions(sessions);

  // Fetch real private bookings from the 'booking' table
  // Fetch real private bookings from the 'booking' table
  // Use getActiveBookingsByType to ensure we only block Confirmed or Valid Holds
  const realBookings = await getActiveBookingsByType("adult");

  // Map real bookings to BookedSession format (normalizing UTC to EST)
  const mappedRealBookings = realBookings.map((b) => ({
    date: b.startTime, // UTC Date object
    startTime: toESTTimeString(b.startTime),
    endTime: toESTTimeString(b.endTime),
  }));

  const bookedSessions = [...programSessionBookings, ...mappedRealBookings];
  // Get instructor availability (now contains a specific schedule JSON)
  const availabilityData = await getInstructorAvailability("adult");

  // Flatten all schedules
  const rawSlots: any[] = availabilityData.flatMap((entry) => {
    const schedule = entry.schedule;
    if (Array.isArray(schedule)) {
      return schedule;
    }
    return [];
  });

  const availableSlots = filterAvailableSlots(rawSlots, bookedSessions);

  if (!program) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          <div className="lg:col-span-3 space-y-2">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Adult Private Golf Instruction
            </h1>
          </div>
          <div className="lg:col-span-6">
            <ProgramComingSoonCard programName="Adult Private Golf Instruction" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdultPrivateGolfInstructionClient
      program={program}
      initialAvailableSlots={availableSlots}
    />
  );
}
