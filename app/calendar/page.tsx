import React from "react";
import Link from "next/link";
import {
  ProgramCalendar,
  CalendarEvent,
} from "@/app/components/ProgramCalendar";
import { parseSchedule, parseLocalDate } from "@/lib/session-schedule";
import {
  getInstructorAvailability,
  getProgramsWithSessions,
} from "@/db/queries/programs";
import { getActiveBookingsByType } from "@/db/queries/bookings";
import {
  filterAvailableSlots,
  extractBookedSessions,
  toESTTimeString,
  mergeSlotsToIntervals,
} from "@/lib/availability";
import {
  ADULT_PRIVATE_INSTRUCTION_DESCRIPTION,
  JUNIOR_PRIVATE_INSTRUCTION_DESCRIPTION,
} from "@/lib/private-instruction-descriptions";

// Map program names to their page URLs
// Keys should be normalized (lowercase, trimmed) for better matching
const PROGRAM_URL_MAP: Record<string, string> = {
  // Adult Programs
  "get golf ready (level i)": "/adult-programs/get-golf-ready-level-1",
  "get golf ready (level ii)": "/adult-programs/get-golf-ready-level-2",
  "adult short game series": "/adult-programs/short-game",
  "golf for women": "/adult-programs/women",
  "adult open practice": "/adult-programs/open-practice",
  "adult private golf instruction": "/adult-programs/private",

  // Junior Programs
  "junior beginner series": "/junior-programs/beginner-series",
  "junior developmental series": "/junior-programs/developmental-series",
  "junior golf camp": "/junior-programs/golf-camp",
  "junior private instruction": "/junior-programs/private-instruction",
};

function getProgramUrl(
  programName: string,
  sessionId: string,
): string | undefined {
  // Normalize program name to match keys (lowercase, trim)
  const normalizedName = programName.trim().toLowerCase();

  // Try exact match first
  let baseUrl = PROGRAM_URL_MAP[normalizedName];

  // If no match, try to find a key that is contained in the program name (fuzzyish)
  // Sort keys by length descending to match most specific names first (prevents Level I vs Level II collision)
  if (!baseUrl) {
    const key = Object.keys(PROGRAM_URL_MAP)
      .sort((a, b) => b.length - a.length)
      .find((k) => normalizedName.includes(k));
    if (key) {
      baseUrl = PROGRAM_URL_MAP[key];
    }
  }

  if (baseUrl) {
    return `${baseUrl}?sessionId=${sessionId}`;
  }

  return undefined;
}

// Helper function to generate calendar events from database
async function generateCalendarEvents(): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = [];

  // Get all adult programs
  const adultPrograms = await getProgramsWithSessions("adult");
  adultPrograms.forEach((program) => {
    program.sessions?.forEach((session) => {
      // Parse schedule from session
      const schedule = parseSchedule(session.schedule);

      if (schedule && schedule.length > 0) {
        // Create individual events for each session date
        schedule.forEach((sessionDate, index) => {
          events.push({
            id: `${session.id}-${index}`,
            title: program.name,
            date: parseLocalDate(sessionDate.date),
            programType: "adult" as const,
            color: "#f97316", // Orange for adult programs
            startTime: sessionDate.startTime,
            endTime: sessionDate.endTime,
            sessionName: session.name,
            programDescription: program.description,
            url: getProgramUrl(program.name, session.id),
          });
        });
      } else {
        // Fallback to startDate if no schedule
        events.push({
          id: session.id,
          title: program.name,
          date: session.startDate,
          programType: "adult" as const,
          color: "#f97316", // Orange for adult programs
          startTime: "TBD",
          endTime: "TBD",
          sessionName: session.name,
          programDescription: program.description,
          url: getProgramUrl(program.name, session.id),
        });
      }
    });
  });

  // Get all junior programs
  const juniorPrograms = await getProgramsWithSessions("junior");
  juniorPrograms.forEach((program) => {
    program.sessions?.forEach((session) => {
      // Parse schedule from session
      const schedule = parseSchedule(session.schedule);

      if (schedule && schedule.length > 0) {
        // Create individual events for each session date
        schedule.forEach((sessionDate, index) => {
          events.push({
            id: `${session.id}-${index}`,
            title: program.name,
            date: parseLocalDate(sessionDate.date),
            programType: "junior" as const,
            color: "#22c55e", // Green for junior programs
            startTime: sessionDate.startTime,
            endTime: sessionDate.endTime,
            sessionName: session.name,
            programDescription: program.description,
            url: getProgramUrl(program.name, session.id),
          });
        });
      } else {
        // Fallback to startDate if no schedule
        events.push({
          id: session.id,
          title: program.name,
          date: session.startDate,
          programType: "junior" as const,
          color: "#22c55e", // Green for junior programs
          startTime: "TBD",
          endTime: "TBD",
          sessionName: session.name,
          programDescription: program.description,
          url: getProgramUrl(program.name, session.id),
        });
      }
    });
  });

  return events;
}

// Helper function to add private instruction availability to events
async function addPrivateInstructionEvents(events: CalendarEvent[]) {
  // Adult Private Availability
  const adultAvailabilityData = await getInstructorAvailability("adult");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adultRawSlots: any[] = adultAvailabilityData.flatMap((entry) => {
    const schedule = entry.schedule;
    return Array.isArray(schedule) ? schedule : [];
  });

  const adultRealBookings = await getActiveBookingsByType("adult");
  const adultBookedSessions = [
    ...adultRealBookings.map((b) => ({
      date: b.startTime,
      startTime: toESTTimeString(b.startTime),
      endTime: toESTTimeString(b.endTime),
    })),
  ];

  const adultAvailableSlots = filterAvailableSlots(
    adultRawSlots,
    adultBookedSessions,
  );
  const adultIntervals = mergeSlotsToIntervals(adultAvailableSlots);

  Object.entries(adultIntervals).forEach(([dateKey, intervals]) => {
    // Format intervals to "h:mm AM/PM - h:mm AM/PM"
    const formattedIntervals = intervals
      .map((interval) => {
        const [start, end] = interval.split("-");
        const formatTime = (t: string) => {
          const [h, m] = t.split(":").map(Number);
          const d = new Date();
          d.setHours(h, m);
          return d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: "America/New_York",
          });
        };
        return `${formatTime(start)} - ${formatTime(end)}`;
      })
      .join(", ");

    events.push({
      id: `adult-private-${dateKey}`,
      title: `Adult Private Instruction`,
      date: parseLocalDate(dateKey),
      programType: "adult",
      color: "#ea580c", // Dark Orange
      startTime: formattedIntervals,
      endTime: "",
      sessionName: "",
      programDescription: ADULT_PRIVATE_INSTRUCTION_DESCRIPTION,
      url: "/adult-programs/private",
    });
  });

  // Junior Private Availability
  const juniorAvailabilityData = await getInstructorAvailability("junior");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const juniorRawSlots: any[] = juniorAvailabilityData.flatMap((entry) => {
    const schedule = entry.schedule;
    return Array.isArray(schedule) ? schedule : [];
  });

  const juniorRealBookings = await getActiveBookingsByType("junior");
  const juniorBookedSessions = [
    ...juniorRealBookings.map((b) => ({
      date: b.startTime,
      startTime: toESTTimeString(b.startTime),
      endTime: toESTTimeString(b.endTime),
    })),
  ];

  const juniorAvailableSlots = filterAvailableSlots(
    juniorRawSlots,
    juniorBookedSessions,
  );
  const juniorIntervals = mergeSlotsToIntervals(juniorAvailableSlots);

  Object.entries(juniorIntervals).forEach(([dateKey, intervals]) => {
    // Format intervals
    const formattedIntervals = intervals
      .map((interval) => {
        const [start, end] = interval.split("-");
        const formatTime = (t: string) => {
          const [h, m] = t.split(":").map(Number);
          const d = new Date();
          d.setHours(h, m);
          return d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: "America/New_York",
          });
        };
        return `${formatTime(start)} - ${formatTime(end)}`;
      })
      .join(", ");

    events.push({
      id: `junior-private-${dateKey}`,
      title: `Junior Private Instruction`,
      date: parseLocalDate(dateKey),
      programType: "junior",
      color: "#15803d", // Darker green
      startTime: formattedIntervals,
      endTime: "",
      sessionName: "",
      programDescription: JUNIOR_PRIVATE_INSTRUCTION_DESCRIPTION,
      url: "/junior-programs/private-instruction",
    });
  });
}

export default async function CalendarPage() {
  const events = await generateCalendarEvents();
  await addPrivateInstructionEvents(events);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Program Schedule Calendar
            </h1>
            <p className="text-gray-600">
              View all upcoming program and private instruction sessions
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <ProgramCalendar events={events} maxHeight="650px" />
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="flex max-h-[min(320px,55vh)] flex-col rounded-xl bg-white p-6 shadow-sm md:max-h-[360px]">
              <h2 className="mb-3 shrink-0 text-xl font-bold text-gray-800">
                Adult Programs
              </h2>
              <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 text-sm text-gray-700 [scrollbar-gutter:stable]">
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                  <Link href="/adult-programs/get-golf-ready-level-1" className="hover:text-orange-600 transition-colors">Adult Get Golf Ready Level 1</Link>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                  <Link href="/adult-programs/get-golf-ready-level-2" className="hover:text-orange-600 transition-colors">Adult Get Golf Ready Level 2</Link>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                  <Link href="/adult-programs/short-game" className="hover:text-orange-600 transition-colors">Adult Short Game Series</Link>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                  <Link href="/adult-programs/women" className="hover:text-orange-600 transition-colors">Golf For Women</Link>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                  <Link href="/adult-programs/open-practice" className="hover:text-orange-600 transition-colors">Adult Open Practice</Link>
                </li>
                <li className="pt-2 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ea580c] shrink-0" />
                    <Link href="/adult-programs/private" className="hover:text-[#ea580c] transition-colors">Adult Private Instruction</Link>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex max-h-[min(320px,55vh)] flex-col rounded-xl bg-white p-6 shadow-sm md:max-h-[360px]">
              <h2 className="mb-3 shrink-0 text-xl font-bold text-gray-800">
                Junior Programs
              </h2>
              <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 text-sm text-gray-700 [scrollbar-gutter:stable]">
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                  <Link href="/junior-programs/beginner-series" className="hover:text-green-600 transition-colors">Junior Beginner Series</Link>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                  <Link href="/junior-programs/developmental-series" className="hover:text-green-600 transition-colors">Junior Developmental Series</Link>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                  <Link href="/junior-programs/developmental-camp" className="hover:text-green-600 transition-colors">Junior Developmental Camp</Link>
                </li>
                <li className="pt-2 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#15803d] shrink-0" />
                    <Link href="/junior-programs/private-instruction" className="hover:text-[#15803d] transition-colors">Junior Private Instruction</Link>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
