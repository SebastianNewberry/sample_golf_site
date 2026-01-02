/**
 * Session Schedule Types and Helpers
 *
 * Defines the structure for recurring session schedules.
 */

/**
 * Days of the week (0 = Sunday, 6 = Saturday)
 */
export const DAYS_OF_WEEK = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
} as const;

export type DayOfWeek = keyof typeof DAYS_OF_WEEK;

/**
 * Short day names for compact display
 */
export const DAYS_SHORT = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
} as const;

/**
 * The schedule configuration for a program session.
 */
export interface SessionSchedule {
  /** Array of day numbers (0=Sunday, 1=Monday, ..., 6=Saturday) */
  daysOfWeek: DayOfWeek[];
  /** Start time in 24h format "HH:MM" (e.g., "09:00") */
  startTime: string;
  /** End time in 24h format "HH:MM" (e.g., "10:00") */
  endTime: string;
}

/**
 * Common schedule presets for quick selection
 */
export const SCHEDULE_PRESETS: { label: string; schedule: SessionSchedule }[] = [
  {
    label: "Saturdays 9:00 AM - 10:00 AM",
    schedule: { daysOfWeek: [6], startTime: "09:00", endTime: "10:00" },
  },
  {
    label: "Saturdays 10:00 AM - 11:00 AM",
    schedule: { daysOfWeek: [6], startTime: "10:00", endTime: "11:00" },
  },
  {
    label: "Saturdays 11:00 AM - 12:00 PM",
    schedule: { daysOfWeek: [6], startTime: "11:00", endTime: "12:00" },
  },
  {
    label: "Thursdays 6:00 PM - 7:00 PM",
    schedule: { daysOfWeek: [4], startTime: "18:00", endTime: "19:00" },
  },
  {
    label: "Tuesday/Thursday 6:00 PM - 7:00 PM",
    schedule: { daysOfWeek: [2, 4], startTime: "18:00", endTime: "19:00" },
  },
  {
    label: "Monday/Wednesday/Friday 9:00 AM - 10:00 AM",
    schedule: { daysOfWeek: [1, 3, 5], startTime: "09:00", endTime: "10:00" },
  },
  {
    label: "Weekdays 9:00 AM - 3:00 PM (Camp)",
    schedule: { daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "15:00" },
  },
];

/**
 * Parse JSON string to SessionSchedule, with fallback.
 */
export function parseSchedule(scheduleJson: string | null): SessionSchedule | null {
  if (!scheduleJson) return null;
  try {
    const parsed = JSON.parse(scheduleJson);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      Array.isArray(parsed.daysOfWeek) &&
      typeof parsed.startTime === "string" &&
      typeof parsed.endTime === "string"
    ) {
      return parsed as SessionSchedule;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Stringify SessionSchedule to JSON.
 */
export function stringifySchedule(schedule: SessionSchedule): string {
  return JSON.stringify(schedule);
}

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
 * Format a schedule for display.
 * @param schedule The session schedule
 * @returns Human-readable string like "Tue/Thu 6:00 PM - 7:00 PM"
 */
export function formatSchedule(schedule: SessionSchedule | null): string {
  if (!schedule) return "Schedule TBD";

  const days = schedule.daysOfWeek
    .sort((a, b) => a - b)
    .map((d) => DAYS_SHORT[d])
    .join("/");

  const startTime = formatTime12h(schedule.startTime);
  const endTime = formatTime12h(schedule.endTime);

  return `${days} ${startTime} - ${endTime}`;
}

/**
 * Format a schedule as a full description.
 * @param schedule The session schedule
 * @returns Full description like "Tuesdays and Thursdays from 6:00 PM to 7:00 PM"
 */
export function formatScheduleFull(schedule: SessionSchedule | null): string {
  if (!schedule) return "Schedule to be determined";

  const dayNames = schedule.daysOfWeek
    .sort((a, b) => a - b)
    .map((d) => DAYS_OF_WEEK[d] + "s"); // Add 's' for plural

  let daysText: string;
  if (dayNames.length === 1) {
    daysText = dayNames[0];
  } else if (dayNames.length === 2) {
    daysText = `${dayNames[0]} and ${dayNames[1]}`;
  } else {
    const lastDay = dayNames.pop();
    daysText = `${dayNames.join(", ")}, and ${lastDay}`;
  }

  const startTime = formatTime12h(schedule.startTime);
  const endTime = formatTime12h(schedule.endTime);

  return `${daysText} from ${startTime} to ${endTime}`;
}

/**
 * Calculate all session dates within a date range based on the schedule.
 * @param startDate The start of the session series
 * @param endDate The end of the session series
 * @param schedule The recurring schedule
 * @returns Array of dates when sessions occur
 */
export function calculateSessionDates(
  startDate: Date,
  endDate: Date,
  schedule: SessionSchedule
): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay() as DayOfWeek;
    if (schedule.daysOfWeek.includes(dayOfWeek)) {
      // Create a new date with the scheduled time
      const [hours, minutes] = schedule.startTime.split(":").map(Number);
      const sessionDate = new Date(current);
      sessionDate.setHours(hours, minutes, 0, 0);
      dates.push(sessionDate);
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Count total sessions within a date range based on the schedule.
 */
export function countSessions(
  startDate: Date,
  endDate: Date,
  schedule: SessionSchedule
): number {
  return calculateSessionDates(startDate, endDate, schedule).length;
}


