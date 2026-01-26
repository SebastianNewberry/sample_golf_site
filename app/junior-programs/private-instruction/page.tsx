import {
  getInstructorAvailability,
  getProgramById,
  getProgramSessions,
} from "@/db/queries/programs";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import { JuniorPrivateGolfInstructionClient } from "./JuniorPrivateGolfInstructionClient";
import {
  filterAvailableSlots,
  extractBookedSessions,
  toESTTimeString,
} from "@/lib/availability";
import { getActiveBookingsByType } from "@/db/queries/bookings";

export default async function JuniorPrivateGolfInstruction() {
  const program = await getProgramById("754bf4be-0ef6-4123-b5ff-b107e03c2f10");
  const sessions = program ? await getProgramSessions(program.id) : [];
  // Parse existing sessions into BookedSession format
  const programSessionBookings = extractBookedSessions(sessions);

  // Fetch real private bookings from the 'booking' table
  const realBookings = await getActiveBookingsByType("junior");

  // Map real bookings to BookedSession format (normalizing UTC to EST)
  const mappedRealBookings = realBookings.map((b) => ({
    date: b.startTime, // UTC Date object
    startTime: toESTTimeString(b.startTime),
    endTime: toESTTimeString(b.endTime),
  }));

  const bookedSessions = [...programSessionBookings, ...mappedRealBookings];

  // Get instructor availability (now contains a specific schedule JSON)
  const availabilityData = await getInstructorAvailability("junior");

  // Flatten all schedules from all matching rows (likely just one)
  const rawSlots: any[] = availabilityData.flatMap((entry) => {
    const schedule = entry.schedule;
    // Check if valid array
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
              Junior Private Golf Instruction
            </h1>
          </div>
          <div className="lg:col-span-6">
            <ProgramComingSoonCard programName="Junior Private Golf Instruction" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <JuniorPrivateGolfInstructionClient
      program={program}
      initialAvailableSlots={availableSlots}
    />
  );
}
