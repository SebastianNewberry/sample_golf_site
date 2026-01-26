import React from "react";
import { ProgramCalendar } from "@/app/components/ProgramCalendar";
import { getProgramsWithSessions } from "@/db/queries/programs";
import { parseSchedule, parseLocalDate } from "@/lib/session-schedule";

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
async function generateCalendarEvents() {
  const events = [];

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
            color: "#3b82f6", // Blue for adult programs
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
          color: "#3b82f6", // Blue for adult programs
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

export default async function CalendarPage() {
  const events = await generateCalendarEvents();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Program Schedule Calendar
            </h1>
            <p className="text-gray-600">
              View all upcoming program sessions at a glance
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <ProgramCalendar events={events} maxHeight="600px" />
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Adult Programs
              </h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Get Golf Ready (Level I & II)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Adult Short Game Series</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Golf For Women</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Adult Open Practice</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Junior Programs
              </h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Junior Beginner Series</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Junior Developmental Series</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Junior Golf Camp</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Junior Developmental Camp</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
