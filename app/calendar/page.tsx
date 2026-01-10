import React from "react";
import { ProgramCalendar } from "@/app/components/ProgramCalendar";
import { getProgramsWithSessions } from "@/db/queries/programs";
import { parseSchedule, parseLocalDate } from "@/lib/session-schedule";

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

