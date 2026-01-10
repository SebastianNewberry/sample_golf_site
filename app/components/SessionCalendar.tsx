"use client";

import React from "react";
import { SessionDate, formatTime12h } from "@/lib/session-schedule";

interface SessionCalendarProps {
  schedule: SessionDate[] | null;
}

export function SessionCalendar({ schedule }: SessionCalendarProps) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 font-medium">
          Select a session to view calendar dates
        </p>
      </div>
    );
  }

  // Parse dates from schedule - directly parse YYYY-MM-DD without UTC suffix
  const sessionDates = schedule.map((s) => {
    // Parse date string (YYYY-MM-DD) to Date object
    const [year, month, day] = s.date.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return {
      date,
      dateKey: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
    };
  });

  // Get date range using local Date objects
  const sortedDates = [...sessionDates].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const minDate = sortedDates[0].date;
  const maxDate = sortedDates[sortedDates.length - 1].date;

  // Generate months between min and max date
  const months: Date[] = [];
  const currentDate = new Date(minDate);
  currentDate.setDate(1); // Set to first of month

  while (currentDate <= maxDate) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Helper to get days in month
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Helper to get first day of month (0-6, 0 = Sunday)
  const getFirstDayOfMonth = (date: Date): number => {
    return date.getDay();
  };

  // Check if a date is in the schedule by comparing date keys
  const getSessionForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    return sessionDates.find((s) => s.dateKey === dateKey);
  };

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-visible">
      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
        Session Schedule
      </h3>

      <div className="grid grid-cols-1 gap-4 overflow-visible">
        {months.map((monthDate, monthIndex) => {
          const year = monthDate.getFullYear();
          const month = monthDate.getMonth();
          const daysInMonth = getDaysInMonth(monthDate);
          const firstDay = getFirstDayOfMonth(monthDate);

          const monthName = monthDate.toLocaleDateString("en-US", {
            month: "short",
          });

          // Generate calendar grid
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
              {/* Month header */}
              <div className="bg-green-600 text-white px-3 py-1.5 text-center rounded-t-lg">
                <span className="text-sm font-bold">{monthName}</span>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 bg-gray-100 overflow-visible">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                  <div
                    key={idx}
                    className="aspect-square py-1.5 text-center text-[10px] font-semibold text-gray-600 border-b border-gray-200"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 p-1.5 rounded-b-lg overflow-visible">
                {calendarDays.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <div
                        key={dayIndex}
                        className="aspect-square bg-gray-50"
                      />
                    );
                  }

                  const session = getSessionForDate(day);
                  const isSessionDate = !!session;

                  return (
                    <div
                      key={dayIndex}
                      className={`aspect-square flex items-center justify-center text-xs rounded-sm transition-all relative group ${
                        isSessionDate
                          ? "bg-green-500 text-white font-semibold cursor-pointer hover:bg-green-600"
                          : "bg-white text-gray-700"
                      }`}
                      title={
                        session
                          ? `${day.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
${formatTime12h(session.startTime)} - ${formatTime12h(session.endTime)}`
                          : undefined
                      }
                    >
                      {day.getDate()}
                      {isSessionDate && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                          <div className="font-semibold">
                            {day.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div>
                            {formatTime12h(session.startTime)} -{" "}
                            {formatTime12h(session.endTime)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
        <div className="w-4 h-4 bg-green-500 rounded-sm" />
        <span>Session dates</span>
        <span className="text-gray-400">• Hover for details</span>
      </div>
    </div>
  );
}
