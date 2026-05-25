/**
 * Session Schedule Types and Helpers
 *
 * Defines the structure for the new individual date/time schedule format.
 */

/**
 * Parse an ISO date string (YYYY-MM-DD) into a Date that represents that
 * calendar day in America/New_York.
 *
 * We anchor the moment at 12:00 UTC. Noon UTC is always the same calendar
 * day in any timezone from UTC-11 through UTC+11 (including ET, which is
 * UTC-4/-5). Anchoring at midnight (either local- or UTC-midnight) breaks
 * when the runtime timezone differs from America/New_York: e.g. on a UTC
 * server, `new Date(2025, 3, 14)` is 2025-04-14T00:00Z, which formats as
 * Apr 13 in America/New_York — the off-by-one bug.
 *
 * @param isoDate Date string in YYYY-MM-DD format
 */
export function parseLocalDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00Z`);
}

/**
 * Individual session date and time
 */
export interface SessionDate {
  /** Date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Start time in 24h format "HH:MM" (e.g., "09:00") */
  startTime: string;
  /** End time in 24h format "HH:MM" (e.g., "10:00") */
  endTime: string;
}

/**
 * The schedule configuration for a program session.
 * Array of individual session dates with times.
 */
export type ProgramSessionSchedule = SessionDate[];

/**
 * Convert 24h time to 12h format with AM/PM.
 * @param time24 Time in "HH:MM" format
 * @returns Time in "h:MM AM/PM" format
 */
export function formatTime12h(time24: string): string {
  const [hoursStr, minutes] = time24.split(":");
  const hours = parseInt(hoursStr, 10);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}

/**
 * Format a session date for display.
 * @param sessionDate The session date and time
 * @returns Formatted string like "Mon, Apr 14, 2025 - 9:00 AM - 10:00 AM"
 */
export function formatSessionDate(sessionDate: SessionDate): string {
  const date = parseLocalDate(sessionDate.date);
  const startTime = formatTime12h(sessionDate.startTime);
  const endTime = formatTime12h(sessionDate.endTime);
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/New_York' });
  const monthDayYear = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    timeZone: 'America/New_York'
  });
  
  return `${dayName}, ${monthDayYear} - ${startTime} - ${endTime}`;
}

/**
 * Format a session date in short format.
 * @param sessionDate The session date and time
 * @returns Formatted string like "Mon, Apr 14 - 9:00-10:00 AM"
 */
export function formatSessionDateShort(sessionDate: SessionDate): string {
  const date = parseLocalDate(sessionDate.date);
  const startTime = formatTime12h(sessionDate.startTime);
  const endTime = formatTime12h(sessionDate.endTime);
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/New_York' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });
  
  return `${dayName}, ${monthDay} - ${startTime}-${endTime}`;
}

/**
 * Parse JSON string to ProgramSessionSchedule, with fallback.
 */
export function parseSchedule(scheduleJson: unknown): ProgramSessionSchedule | null {
  if (!scheduleJson) return null;
  
  // If already an array, validate and return
  if (Array.isArray(scheduleJson)) {
    const isValid = scheduleJson.every(item => 
      typeof item === 'object' && 
      item !== null &&
      typeof (item as SessionDate).date === 'string' &&
      typeof (item as SessionDate).startTime === 'string' &&
      typeof (item as SessionDate).endTime === 'string'
    );
    
    return isValid ? scheduleJson as ProgramSessionSchedule : null;
  }
  
  // If string, try to parse
  if (typeof scheduleJson === 'string') {
    try {
      const parsed = JSON.parse(scheduleJson);
      if (Array.isArray(parsed)) {
        return parseSchedule(parsed);
      }
    } catch {
      return null;
    }
  }
  
  return null;
}

/**
 * Stringify ProgramSessionSchedule to JSON.
 */
export function stringifySchedule(schedule: ProgramSessionSchedule): string {
  return JSON.stringify(schedule);
}

/**
 * Format a full schedule for display.
 * @param schedule The session schedule
 * @param maxSessions Maximum number of sessions to display (default: all)
 * @returns Array of formatted session dates
 */
export function formatScheduleDates(
  schedule: ProgramSessionSchedule | null,
  maxSessions?: number
): string[] {
  if (!schedule || schedule.length === 0) return [];
  
  const sessions = maxSessions ? schedule.slice(0, maxSessions) : schedule;
  return sessions.map(formatSessionDate);
}

/**
 * Get the first and last date from a schedule.
 * @param schedule The session schedule
 * @returns Object with firstDate and lastDate, or null if no schedule
 */
export function getScheduleDateRange(schedule: ProgramSessionSchedule | null): {
  firstDate: Date;
  lastDate: Date;
} | null {
  if (!schedule || schedule.length === 0) return null;
  
  // Sort by date
  const sortedSchedule = [...schedule].sort((a, b) =>
    parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()
  );

  return {
    firstDate: parseLocalDate(sortedSchedule[0].date),
    lastDate: parseLocalDate(sortedSchedule[sortedSchedule.length - 1].date),
  };
}

/**
 * Count total sessions in schedule.
 */
export function countSessions(schedule: ProgramSessionSchedule | null): number {
  return schedule?.length || 0;
}

/**
 * Get summary text for a schedule.
 * @param schedule The session schedule
 * @returns Summary like "5 sessions: Mon Apr 14, 2025 - Mon May 12, 2025"
 */
export function getScheduleSummary(schedule: ProgramSessionSchedule | null): string {
  const sessionCount = countSessions(schedule);
  
  if (sessionCount === 0) {
    return "No sessions scheduled";
  }
  
  const dateRange = getScheduleDateRange(schedule);
  if (!dateRange) {
    return `${sessionCount} session${sessionCount !== 1 ? 's' : ''}`;
  }
  
  const startDateStr = dateRange.firstDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York'
  });
  
  const endDateStr = dateRange.lastDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York'
  });
  
  return `${sessionCount} session${sessionCount !== 1 ? 's' : ''}: ${startDateStr} - ${endDateStr}`;
}
