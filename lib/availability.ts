import { addDays, format, isSameDay, startOfDay } from "date-fns";

export interface AvailabilityRule {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface Interval {
  info: any;
  start: string;
  end: string;
}

export function mergeSlotsToIntervals(slots: TimeSlot[]): Record<string, string[]> {
  const slotsByDate: Record<string, TimeSlot[]> = {};

  // Group by date
  slots.forEach((slot) => {
    // Determine date key (using the date object's local date string or ISO string if handled carefully)
    // We used `toESTDateString` logic effectively in filterAvailableSlots, 
    // but here we have TimeSlot objects with a Date property.
    // Let's assume the Date object is correct corresponding to the slot.
    const dateKey = slot.date.toLocaleDateString("en-CA", {
      timeZone: "America/New_York",
    });
    if (!slotsByDate[dateKey]) {
      slotsByDate[dateKey] = [];
    }
    slotsByDate[dateKey].push(slot);
  });

  const result: Record<string, string[]> = {};

  Object.keys(slotsByDate).forEach((dateKey) => {
    const daySlots = slotsByDate[dateKey];
    // Sort just in case
    daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const intervals: string[] = [];
    if (daySlots.length === 0) return;

    let currentStart = daySlots[0].startTime;
    let currentEnd = daySlots[0].endTime;

    for (let i = 1; i < daySlots.length; i++) {
      const next = daySlots[i];

      // Check continuity
      // If next.startTime === currentEnd, we merge
      // (Assuming 30 min slots, so adjacent means continuous)
      if (next.startTime === currentEnd) {
        currentEnd = next.endTime;
      } else {
        // Gap found, push current and start new
        // Format: H:mm - H:mm (or AM/PM conversion later? The prompt asked for "10:30 to 11:30")
        // The prompt asked for: "from the start time to 10:30 and then from 11:30 to the end time"
        // Let's stick to 24h here for internal representation or convert? 
        // The prompt example implies AM/PM. Let's do formatting in the page so this function remains generic
        // OR we can do it here. Let's return Generic "HH:mm-HH:mm" strings and format in the View.
        intervals.push(`${currentStart}-${currentEnd}`);
        currentStart = next.startTime;
        currentEnd = next.endTime;
      }
    }
    intervals.push(`${currentStart}-${currentEnd}`);
    result[dateKey] = intervals;
  });

  return result;
}

export interface BookedSession {
  date: Date;
  startTime: string;
  endTime: string;
}

export interface TimeSlot {
  date: Date;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface RawSlot {
  date: string; // ISO date string or YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

// Helper to get EST HH:mm time string from a Date object
export const toESTTimeString = (date: Date) => {
  // Use toLocaleTimeString with America/New_York timezone
  const timeStr = date.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour12: false,
  });
  // Format is likely "HH:mm:ss" or "H:mm:ss" depending on locale options, usually H:mm:ss for en-US 24h
  // We want "HH:mm"
  const parts = timeStr.split(":");
  const h = parts[0].padStart(2, "0");
  const m = parts[1].padStart(2, "0");
  return `${h}:${m}`;
};

export function extractBookedSessions(sessions: any[]): BookedSession[] {
  return sessions.flatMap((s) => {
    const sched =
      typeof s.schedule === "string" ? JSON.parse(s.schedule) : s.schedule;

    if (Array.isArray(sched) && sched.length > 0) {
      return sched.map((slot: any) => ({
        date: new Date(slot.date),
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
    } else {
      // If no schedule JSON, assume the session date/time itself is the booking
      // Convert UTC timestamps to EST "HH:mm" strings

      console.log("dates is ", {
        date: s.startDate, // UTC Date object
        startTime: toESTTimeString(new Date(s.startDate)),
        endTime: toESTTimeString(new Date(s.endDate)),
      });
      return [
        {
          date: s.startDate, // UTC Date object
          startTime: toESTTimeString(new Date(s.startDate)),
          endTime: toESTTimeString(new Date(s.endDate)),
        },
      ];
    }
  });
}

export function filterAvailableSlots(
  rawSlots: RawSlot[],
  bookedSessions: BookedSession[],
): TimeSlot[] {
  // Helper to convert time string to minutes
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Helper to convert minutes to time string
  const toTimeStr = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  // Helper to get EST YYYY-MM-DD string from a Date object
  const toESTDateString = (date: Date): string => {
    return date.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  };

  // Helper to ensure we treat the raw slot date string as a local date (prevent UTC shift)
  // If slot.date is "2025-05-15", we want "2025-05-15".
  const getRawSlotDateString = (dateStr: string): string => {
    // If it has 'T', split it. If not, use as is.
    return dateStr.split("T")[0];
  };

  const fragmentedSlots: TimeSlot[] = [];

  // Process each raw availability slot
  for (const slot of rawSlots) {
    // The slot.date is the target "Wall Clock" date (e.g., "2025-05-15").
    // We construct a Date object for it, but be careful with timezones.
    // For the output TimeSlot, we want to return a Date object?
    // The previous code returned `new Date(slot.date)`.
    // Let's stick to that for the *object* we return, but use string comparison for filtering.

    // HOWEVER, `new Date("2025-05-15")` is UTC.
    // If the frontend interprets it as local, it might shift.
    // But let's assume `slot.date` string is the source of truth.
    const slotDateKey = getRawSlotDateString(slot.date);

    // For the Date object in the result, we need to satisfy the interface.
    // We should probably ensure the Date object represents that day.
    const slotReturnDate = new Date(slot.date);

    const slotStart = toMinutes(slot.startTime);
    const slotEnd = toMinutes(slot.endTime);

    // Find bookings for this day (Converting booking date to EST)
    const dayBookings = bookedSessions
      .filter((b) => toESTDateString(b.date) === slotDateKey)
      .map((b) => ({
        start: toMinutes(b.startTime),
        end: toMinutes(b.endTime),
      }))
      .sort((a, b) => a.start - b.start);

    // Subtract bookings from this slot
    let currentStart = slotStart;

    for (const booking of dayBookings) {
      // If booking is completely before current pointer, ignore
      if (booking.end <= currentStart) continue;

      // If booking starts after current pointer, we have a free chunk
      if (booking.start > currentStart) {
        // Add chunk from currentStart to booking.start
        const chunkEnd = Math.min(booking.start, slotEnd);
        if (chunkEnd > currentStart) {
          fragmentedSlots.push({
            date: slotReturnDate,
            startTime: toTimeStr(currentStart),
            endTime: toTimeStr(chunkEnd),
          });
        }
      }

      // Move pointer to end of booking
      currentStart = Math.max(currentStart, booking.end);

      // If pointer exceeds slot end, we are done with this slot
      if (currentStart >= slotEnd) break;
    }

    // Capture any remaining time after the last booking
    if (currentStart < slotEnd) {
      fragmentedSlots.push({
        date: slotReturnDate,
        startTime: toTimeStr(currentStart),
        endTime: toTimeStr(slotEnd),
      });
    }
  }

  return fragmentedSlots.sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) {
      return a.date.getTime() - b.date.getTime();
    }
    return a.startTime.localeCompare(b.startTime);
  });
}
