"use client";

import React from "react";
import { SessionDate, formatTime12h } from "@/lib/session-schedule";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SessionCalendarProps {
  schedule: SessionDate[] | null;
  hideSessionCount?: boolean;
}

export function SessionCalendar({
  schedule,
  hideSessionCount,
}: SessionCalendarProps) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm relative overflow-visible">
        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
          Session Schedule
        </h3>
        <div className="p-3 text-center text-gray-500 text-sm font-medium">
          No Sessions Yet
        </div>
      </div>
    );
  }


  // Parse dates from schedule
  const sessionDates = schedule.map((s) => {
    const [year, month, day] = s.date.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return {
      date,
      dateKey: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
    };
  });

  // Get date range
  const sortedDates = [...sessionDates].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  const minDate = sortedDates[0].date;
  const maxDate = sortedDates[sortedDates.length - 1].date;

  // Generate months between min and max date
  const months: Date[] = [];
  const currentDate = new Date(minDate);
  currentDate.setDate(1);

  while (currentDate <= maxDate) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return date.getDay();
  };

  const getSessionsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    return sessionDates.filter((s) => s.dateKey === dateKey);
  };

  const getMergedTimeRanges = (
    slots: { startTime: string; endTime: string }[],
  ) => {
    if (slots.length === 0) return [];
    const sorted = [...slots].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );
    const ranges: { start: string; end: string }[] = [];
    let currentStart = sorted[0].startTime;
    let currentEnd = sorted[0].endTime;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].startTime === currentEnd) {
        currentEnd = sorted[i].endTime;
      } else {
        ranges.push({ start: currentStart, end: currentEnd });
        currentStart = sorted[i].startTime;
        currentEnd = sorted[i].endTime;
      }
    }
    ranges.push({ start: currentStart, end: currentEnd });
    return ranges;
  };

  // --- Build grouped schedule summary (same style as cart) ---
  const groupedSchedule = (() => {
    const groups: Record<string, { day: string; time: string; dates: Date[] }> =
      {};

    sortedDates.forEach((s) => {
      const dayName = s.date.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "America/New_York",
      });
      const timeRange = `${formatTime12h(s.startTime)} - ${formatTime12h(s.endTime)}`;
      const key = `${dayName}-${timeRange}`;

      if (!groups[key]) {
        groups[key] = { day: dayName, time: timeRange, dates: [] };
      }
      groups[key].dates.push(s.date);
    });

    return Object.values(groups).map((group) => {
      group.dates.sort((a, b) => a.getTime() - b.getTime());
      const firstDate = group.dates[0];
      const lastDate = group.dates[group.dates.length - 1];

      const formatDateShort = (d: Date) =>
        d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "America/New_York",
        });

      const dateRangeStr =
        group.dates.length > 1
          ? `${formatDateShort(firstDate)} - ${formatDateShort(lastDate)}`
          : formatDateShort(firstDate);

      const dayLabel = group.dates.length > 1 ? group.day + "s" : group.day;

      return {
        dayLabel,
        timeRange: group.time,
        dateRange: dateRangeStr,
        count: group.dates.length,
      };
    });
  })();

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm relative overflow-visible">
      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
        Session Schedule
      </h3>

      <div className="grid grid-cols-2 gap-2 overflow-visible">
        {months.map((monthDate, monthIndex) => {
          const year = monthDate.getFullYear();
          const month = monthDate.getMonth();
          const daysInMonth = getDaysInMonth(monthDate);
          const firstDay = getFirstDayOfMonth(monthDate);

          const monthName = monthDate.toLocaleDateString("en-US", {
            month: "short",
            timeZone: "America/New_York",
          });

          const calendarDays = [];
          for (let i = 0; i < firstDay; i++) {
            calendarDays.push(null);
          }
          for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(new Date(year, month, i));
          }

          return (
            <div
              key={monthIndex}
              className="border border-gray-200 rounded-lg w-full overflow-visible"
            >
              <div className="bg-green-600 text-white px-1 py-1 text-center rounded-t-lg">
                <span className="text-xs font-bold">{monthName}</span>
              </div>

              <div className="grid grid-cols-7 bg-gray-100 overflow-visible">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                  <div
                    key={idx}
                    className="aspect-square flex items-center justify-center text-[8px] font-semibold text-gray-600 border-b border-gray-200"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-200 p-0.5 rounded-b-lg overflow-visible">
                {calendarDays.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <div
                        key={dayIndex}
                        className="aspect-square bg-gray-50"
                      />
                    );
                  }

                  const sessions = getSessionsForDate(day);
                  const isSessionDate = sessions.length > 0;
                  const ranges = getMergedTimeRanges(sessions);

                  return (
                    <TooltipProvider key={dayIndex} disableHoverableContent>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div
                            className={`aspect-square flex items-center justify-center text-[10px] rounded-sm transition-all relative group ${
                              isSessionDate
                                ? "bg-green-500 text-white font-semibold cursor-pointer hover:bg-green-600"
                                : "bg-white text-gray-700"
                            }`}
                            onPointerDown={(e) => e.preventDefault()}
                          >
                            {day.getDate()}
                          </div>
                        </TooltipTrigger>
                        {isSessionDate && (
                          <TooltipContent
                            sideOffset={12}
                            className="bg-gray-900 text-white text-xs border-none max-w-[200px] pointer-events-none"
                          >
                            <div className="font-semibold mb-1">
                              {day.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                timeZone: "America/New_York",
                              })}
                            </div>
                            <div className="space-y-0.5">
                              {ranges.map((range, idx) => (
                                <div key={idx}>
                                  {formatTime12h(range.start)} -{" "}
                                  {formatTime12h(range.end)}
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Summary */}
      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
        {!hideSessionCount && (
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {schedule.length} Session{schedule.length !== 1 ? "s" : ""}
          </p>
        )}
        {groupedSchedule.map((group, idx) => (
          <div key={idx} className="border-l-2 border-green-300 pl-3 py-0.5">
            <p className="font-semibold text-gray-800 text-sm">
              {group.dayLabel} at {group.timeRange}
            </p>
            <p className="text-xs text-gray-500">
              {group.dateRange}
              {!hideSessionCount && group.count > 1 && (
                <span className="text-gray-400 ml-1">
                  ({group.count} sessions)
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
        <div className="w-4 h-4 bg-green-500 rounded-sm" />
        <span>Session dates</span>
      </div>
    </div>
  );
}
