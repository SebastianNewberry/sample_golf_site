"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  ChevronRightIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SafeHTML } from "@/app/components/SafeHTML";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  programType: "adult" | "junior";
  category?: string;
  color: string;
  startTime?: string;
  sessionName?: string;
  endTime?: string;
  programDescription?: string;
  url?: string;
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
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const router = useRouter();

  // The event to display in the tooltip (only on hover for desktop)
  const tooltipEvent = hoveredEvent;

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
        event.date.getDate(),
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

  // Get all events for this month grouped by day (for mobile list view)
  const monthEvents = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const grouped: { day: number; events: CalendarEvent[] }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayEvents = getEventsForDate(d);
      if (dayEvents.length > 0) {
        grouped.push({ day: d, events: dayEvents });
      }
    }
    return grouped;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, daysInMonth, events]);

  // Handle event click/tap — toggle tooltip
  const handleEventInteraction = (
    event: CalendarEvent,
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const tooltipWidth = 320;
    const padding = 16;

    let x = rect.left;
    if (x + tooltipWidth > window.innerWidth) {
      x = Math.max(padding, window.innerWidth - tooltipWidth - padding);
    }

    // If same event is already selected, deselect
    if (selectedEvent?.id === event.id) {
      setSelectedEvent(null);
    } else {
      setSelectedEvent(event);
      setTooltipPosition({ x, y: rect.bottom + 8 });
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden"
      onClick={(e) => {
        // Clear selection when clicking outside of events
        if (!(e.target as HTMLElement).closest("[data-calendar-event]")) {
          setSelectedEvent(null);
        }
      }}
    >
      {/* Calendar Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={previousMonth}
          className="hover:bg-green-700 rounded p-1 transition-colors cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-bold text-lg">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="hover:bg-green-700 rounded p-1 transition-colors cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days of week header — hidden on mobile */}
      <div className="hidden md:grid grid-cols-7 bg-gray-100">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-semibold text-gray-600 border-b border-gray-200"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Desktop: Calendar grid (hidden on mobile) */}
      <div
        className="hidden md:grid grid-cols-7 gap-px bg-gray-200 overflow-auto"
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
              } ${isExpanded ? "min-h-[200px]" : "min-h-[120px]"}`}
            >
              {day && (
                <>
                  <div className="text-xs text-gray-700 font-medium text-center mb-1">
                    {day}
                  </div>
                  <div
                    className={`${isExpanded ? "overflow-y-auto max-h-[160px]" : "space-y-1"}`}
                  >
                    {visibleEvents.map((event) => (
                      <div
                        key={event.id}
                        data-calendar-event
                        className="text-[10px] px-1 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-80 transition-all hover:shadow-md relative mb-1"
                        style={{ backgroundColor: event.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (event.url) {
                            router.push(event.url);
                          } else {
                            handleEventInteraction(event, e);
                          }
                        }}
                        onMouseEnter={(e) => {
                          setHoveredEvent(event);
                          const rect = e.currentTarget.getBoundingClientRect();
                          const tooltipWidth = 320;
                          const padding = 16;
                          let x = rect.left;
                          if (x + tooltipWidth > window.innerWidth) {
                            x = Math.max(
                              padding,
                              window.innerWidth - tooltipWidth - padding,
                            );
                          }
                          setTooltipPosition({ x, y: rect.bottom + 8 });
                        }}
                        onMouseLeave={() => {
                          setHoveredEvent(null);
                        }}
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

      {/* Mobile: List view (hidden on desktop) */}
      <div className="md:hidden overflow-auto" style={{ maxHeight }}>
        {monthEvents.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No events this month.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {monthEvents.map(({ day, events: dayEvents }) => {
              const date = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day,
              );
              const dayName = date.toLocaleDateString("en-US", {
                weekday: "short",
              });
              const monthDay = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <div key={day} className="p-3">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-2">
                    {dayName}, {monthDay}
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        data-calendar-event
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle inline detail on mobile
                          if (selectedEvent?.id === event.id) {
                            setSelectedEvent(null);
                          } else {
                            setSelectedEvent(event);
                          }
                        }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {event.title}
                          </p>
                          {event.startTime && event.endTime && (
                            <p className="text-xs text-gray-500">
                              {event.startTime} - {event.endTime}
                            </p>
                          )}
                          {event.sessionName && (
                            <p className="text-xs text-gray-400">
                              {event.sessionName}
                            </p>
                          )}
                          {/* Inline detail for mobile */}
                          {selectedEvent?.id === event.id && (
                            <div className="mt-2 p-2 bg-white rounded-md border border-gray-200 shadow-sm text-xs text-gray-600 space-y-2">
                              <p className="capitalize font-medium text-gray-800">
                                {event.programType} Program
                              </p>
                              {event.programDescription && (
                                <SafeHTML 
                                  html={event.programDescription} 
                                  className="line-clamp-3 leading-relaxed text-gray-500 [&_*]:inline" 
                                />
                              )}
                              {event.url && (
                                <div className="pt-2 mt-1 border-t border-gray-100">
                                  <Link
                                    href={event.url}
                                    className="text-orange-600 font-medium hover:text-orange-700 flex items-center group transition-colors"
                                  >
                                    View Program Details
                                    <ChevronRightIcon size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                  </Link>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <h4 className="text-sm font-bold text-gray-800 mb-2">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#f97316]" />
            <span className="text-xs text-gray-700">Adult Programs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#ea580c]" />
            <span className="text-xs text-gray-700">
              Adult Private Instruction
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#22c55e]" />
            <span className="text-xs text-gray-700">Junior Programs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#15803d]" />
            <span className="text-xs text-gray-700">
              Junior Private Instruction
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Tooltip (hidden on mobile — mobile uses inline details) */}
      {tooltipEvent && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 pointer-events-none hidden md:block"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="font-bold text-sm text-gray-800 mb-2">
            {tooltipEvent.title}
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            {tooltipEvent.sessionName && (
              <div className="flex items-start gap-2">
                <CalendarIcon size={14} className="mt-0.5 flex-shrink-0" />
                <span>{tooltipEvent.sessionName}</span>
              </div>
            )}
            {tooltipEvent.startTime && tooltipEvent.endTime && (
              <div className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  {tooltipEvent.startTime} - {tooltipEvent.endTime}
                </span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                style={{ backgroundColor: tooltipEvent.color }}
              />
              <span className="capitalize">
                {tooltipEvent.programType} Program
              </span>
            </div>
            {tooltipEvent.programDescription && (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <SafeHTML 
                  html={tooltipEvent.programDescription} 
                  className="line-clamp-3 leading-relaxed text-gray-500 [&_*]:inline" 
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
