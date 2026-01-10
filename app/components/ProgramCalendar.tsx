"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  programType: "adult" | "junior";
  category?: string;
  color: string;
  startTime?: string;
  endTime?: string;
  sessionName?: string;
  programDescription?: string;
}

interface ProgramCalendarProps {
  events: CalendarEvent[];
  maxHeight?: string;
}

export function ProgramCalendar({
  events,
  maxHeight = "400px",
}: ProgramCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  // Get days in month
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentDate]);

  // Get first day of month (0-6, where 0 is Sunday)
  const firstDayOfMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1).getDay();
  }, [currentDate]);

  // Get month name and year
  const monthName = useMemo(() => {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [currentDate]);

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const eventDate = new Date(year, month, day);

    return events.filter((event) => {
      const eventDateOnly = new Date(
        event.date.getFullYear(),
        event.date.getMonth(),
        event.date.getDate()
      );
      return eventDateOnly.getTime() === eventDate.getTime();
    });
  };

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null); // Empty cells for padding
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={previousMonth}
          className="hover:bg-green-700 rounded p-1 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-bold text-lg">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="hover:bg-green-700 rounded p-1 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 bg-gray-100">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-semibold text-gray-600 border-b border-gray-200"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7 gap-px bg-gray-200 overflow-auto"
        style={{ maxHeight }}
      >
        {calendarDays.map((day, index) => {
          const dayEvents = day ? getEventsForDate(day) : [];
          const isExpanded = expandedDays.has(day);
          const visibleEvents = isExpanded ? dayEvents : dayEvents.slice(0, 3);

          return (
            <div
              key={index}
              className={`bg-white p-1 transition-all duration-300 ${
                !day ? "bg-gray-50" : ""
              } ${isExpanded ? "min-h-[200px]" : "min-h-[80px]"}`}
            >
              {day && (
                <>
                  <div className="text-xs text-gray-700 font-medium text-center mb-1">
                    {day}
                  </div>
                  <div className={`${isExpanded ? "overflow-y-auto max-h-[160px]" : "space-y-1"}`}>
                    {visibleEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`text-[10px] px-1 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-80 transition-all hover:shadow-md relative mb-1`}
                        style={{ backgroundColor: event.color }}
                        onMouseEnter={(e) => {
                          setHoveredEvent(event);
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPosition({
                            x: rect.left,
                            y: rect.bottom + window.scrollY + 8,
                          });
                        }}
                        onMouseLeave={() => setHoveredEvent(null)}
                      >
                        {event.title}
                      </div>
                    ))}
                    {!isExpanded && dayEvents.length > 3 && (
                      <button
                        onClick={() => {
                          setExpandedDays((prev) => {
                            const next = new Set(prev);
                            next.add(day);
                            return next;
                          });
                        }}
                        className="w-full text-[10px] text-blue-600 text-center hover:text-blue-800 hover:underline cursor-pointer font-medium"
                      >
                        +{dayEvents.length - 3} more
                      </button>
                    )}
                    {isExpanded && (
                      <button
                        onClick={() => {
                          setExpandedDays((prev) => {
                            const next = new Set(prev);
                            next.delete(day);
                            return next;
                          });
                        }}
                        className="w-full text-[10px] text-gray-500 text-center hover:text-gray-700 hover:underline cursor-pointer font-medium"
                      >
                        Show less
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <h4 className="text-sm font-bold text-gray-800 mb-2">Legend</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-xs text-gray-700">Adult Programs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-xs text-gray-700">Junior Programs</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredEvent && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-bold text-sm text-gray-800 mb-2">
            {hoveredEvent.title}
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            {hoveredEvent.sessionName && (
              <div className="flex items-start gap-2">
                <CalendarIcon size={14} className="mt-0.5 flex-shrink-0" />
                <span>{hoveredEvent.sessionName}</span>
              </div>
            )}
            {hoveredEvent.startTime && hoveredEvent.endTime && (
              <div className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  {hoveredEvent.startTime} - {hoveredEvent.endTime}
                </span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                style={{ backgroundColor: hoveredEvent.color }}
              />
              <span className="capitalize">{hoveredEvent.programType} Program</span>
            </div>
            {hoveredEvent.programDescription && (
              <div className="pt-2 border-t border-gray-100">
                <p className="line-clamp-3 leading-relaxed">
                  {hoveredEvent.programDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

