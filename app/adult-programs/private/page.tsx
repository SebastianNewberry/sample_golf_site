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
import { programPageContent } from "@/app/components/program-page-layout";
import { AdultPrivateGolfInstructionClient } from "./AdultPrivateGolfInstructionClient";
import {
  filterAvailableSlots,
  extractBookedSessions,
  toESTTimeString,
} from "@/lib/availability";
import { getActiveBookingsByType } from "@/db/queries/bookings";
import { addDays } from "date-fns";

export default async function AdultPrivateGolfInstruction() {
  const programId = "f89b62ee-ffda-421d-a525-8bd2a580f24e";

  // Fetch program, bookings, and availability in parallel to avoid sequential delay
  const [program, realBookings, availabilityData] = await Promise.all([
    getProgramById(programId),
    getActiveBookingsByType("adult"),
    getInstructorAvailability("adult"),
  ]);

  // Fetch sessions only if program exists
  const sessions = program ? await getProgramSessions(program.id) : [];

  // Parse existing sessions into BookedSession format (from program_session table - likely empty for private)
  const programSessionBookings = extractBookedSessions(sessions);

  // Map real bookings to BookedSession format (normalizing UTC to EST)
  const mappedRealBookings = realBookings.map((b) => ({
    date: b.startTime, // UTC Date object
    startTime: toESTTimeString(b.startTime),
    endTime: toESTTimeString(b.endTime),
  }));

  const bookedSessions = [...programSessionBookings, ...mappedRealBookings];

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
      <div className={programPageContent}>
        <div className="grid lg:grid-cols-13 gap-6">
          <div className="lg:col-span-3 space-y-2">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Adult Private Golf Instruction
            </h1>
          </div>
          <div className="lg:col-span-7">
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
