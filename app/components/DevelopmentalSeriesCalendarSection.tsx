"use client";

import { SessionCalendar } from "@/app/components/SessionCalendar";
import { ProgramSession } from "@/db/schema";
import { SessionDate, parseSchedule } from "@/lib/session-schedule";

interface DevelopmentalSeriesCalendarSectionProps {
  sessions: ProgramSession[];
  selectedSessionId?: string;
}

export function DevelopmentalSeriesCalendarSection({
  sessions,
  selectedSessionId,
}: DevelopmentalSeriesCalendarSectionProps) {
  // Get selected session's schedule
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const schedule = selectedSession?.schedule
    ? parseSchedule(selectedSession.schedule)
    : null;

  return <SessionCalendar schedule={schedule} />;
}
