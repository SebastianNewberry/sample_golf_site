"use client";

import { useState, useMemo, useEffect } from "react";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  startOfDay,
  isBefore,
  parseISO,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  List as ListIcon,
  Grid as GridIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// --- Types ---

interface TimeSlot {
  date: Date;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface PrivateInstructionCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSlots: TimeSlot[];
  onSelectSlot: (slot: TimeSlot) => void;
  onRemoveSlot?: (slot: TimeSlot) => void;
  selectedSlots?: TimeSlot[];
  // Legacy prop support for transition if needed, but we'll try to move to selectedSlots
  selectedSlot?: TimeSlot | null;
  programName?: string;
  durationMinutes?: number;
  maxSlots?: number;
  inCartSlots?: TimeSlot[];
}

// --- Constants ---
const SLOT_DURATION_MINUTES = 30;
const START_HOUR = 8; // Assuming lessons start around 8am
const END_HOUR = 22; // Until 10pm
const TOTAL_SLOTS_PER_DAY =
  (END_HOUR - START_HOUR) * (60 / SLOT_DURATION_MINUTES);

// --- Helpers ---
const getNowEST = () => {
  const d = new Date();
  const estString = d.toLocaleString("en-US", { timeZone: "America/New_York" });
  return new Date(estString);
};

const normalizeFromUTC = (date: Date | string) => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const getSlotId = (date: Date, hour: number, minute: number) => {
  return `${format(date, "yyyy-MM-dd")}T${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};

const formatTime = (hour: number, minute: number) => {
  const d = new Date();
  d.setHours(hour, minute);
  return format(d, "h:mm a");
};

const formatTime24 = (h: number, m: number) =>
  `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

const formatTime12 = (time24: string) => {
  const [h, m] = time24.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return format(d, "h:mm a");
};

const getDailySlotTimes = () => {
  return Array.from({ length: TOTAL_SLOTS_PER_DAY }, (_, i) => {
    const totalMinutes = START_HOUR * 60 + i * SLOT_DURATION_MINUTES;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return { hour, minute };
  });
};

export function PrivateInstructionCalendar({
  open,
  onOpenChange,
  availableSlots,
  onSelectSlot,
  onRemoveSlot,
  selectedSlots = [], // Default to empty array
  programName,
  durationMinutes = 60, // Default to 60 if missing
  maxSlots = 1,
  selectedSlot, // Keep for backward compat if needed, but prefer selectedSlots
  inCartSlots = [],
}: PrivateInstructionCalendarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [hoveredSlot, setHoveredSlot] = useState<TimeSlot | null>(null);
  const [blockedHoverSlot, setBlockedHoverSlot] = useState<TimeSlot | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");

  useEffect(() => {
    const nowEST = getNowEST();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setCurrentWeekStart(startOfWeek(nowEST, { weekStartsOn: 1 }));
    setIsMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dailySlots = useMemo(() => getDailySlotTimes(), []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // Map of Available Intervals per Day (Merged)
  const dailyIntervalsMap = useMemo(() => {
    const map = new Map<string, Array<{ start: number; end: number }>>();

    availableSlots.forEach((slot) => {
      // Use the same date format as lookups (which use weekDays local dates)
      // We still normalize to handle UTC dates from server
      const normalizedDate = normalizeFromUTC(slot.date);
      const dateKey = format(normalizedDate, "yyyy-MM-dd");
      if (!map.has(dateKey)) map.set(dateKey, []);

      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);
      map.get(dateKey)!.push({
        start: startH * 60 + startM,
        end: endH * 60 + endM,
      });
    });

    // Sort and Merge
    map.forEach((intervals, key) => {
      if (intervals.length === 0) return;
      intervals.sort((a, b) => a.start - b.start);

      const merged: Array<{ start: number; end: number }> = [];
      let current = intervals[0];

      for (let i = 1; i < intervals.length; i++) {
        const next = intervals[i];
        if (next.start <= current.end) {
          // Overlap or adjacent, merge
          current.end = Math.max(current.end, next.end);
        } else {
          merged.push(current);
          current = next;
        }
      }
      merged.push(current);
      map.set(key, merged);
    });

    return map;
  }, [availableSlots]);

  // Keep strict ID set for simple existence checks (rendering white boxes)
  const availableSlotIds = useMemo(() => {
    const ids = new Set<string>();
    availableSlots.forEach((slot) => {
      const date = normalizeFromUTC(slot.date);
      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);

      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      for (let t = startTotal; t < endTotal; t += 30) {
        const h = Math.floor(t / 60);
        const m = t % 60;
        ids.add(getSlotId(date, h, m));
      }
    });
    return ids;
  }, [availableSlots]);

  // --- List View Logic ---
  const sortedAvailableDates = useMemo(() => {
    // Get all unique dates from availableIntervals
    const uniqueDates = new Set<string>();
    dailyIntervalsMap.forEach((_, dateKey) => {
      // Only include if there are valid intervals
      // (Optional: also check if any *duration* fits, but we can do that at render time)
      uniqueDates.add(dateKey);
    });
    return Array.from(uniqueDates).sort();
  }, [dailyIntervalsMap]);

  // Check if a specific time is already selected (for highlighting)
  const isTimeSelected = (date: Date, hour: number, minute: number) => {
    const slotTotal = hour * 60 + minute;
    // Check legacy selectedSlot
    if (selectedSlot) {
      const sDate = normalizeFromUTC(selectedSlot.date);
      if (isSameDay(sDate, date)) {
        const [sH, sM] = selectedSlot.startTime.split(":").map(Number);
        const [eH, eM] = selectedSlot.endTime.split(":").map(Number);
        const sTotal = sH * 60 + sM;
        const eTotal = eH * 60 + eM;
        if (slotTotal >= sTotal && slotTotal < eTotal) return true;
      }
    }

    // Check new selectedSlots
    // Check new selectedSlots
    if (
      selectedSlots.some((slot) => {
        const sDate = normalizeFromUTC(slot.date);
        if (!isSameDay(sDate, date)) return false;

        const [sH, sM] = slot.startTime.split(":").map(Number);
        const [eH, eM] = slot.endTime.split(":").map(Number);

        const sTotal = sH * 60 + sM;
        const eTotal = eH * 60 + eM;

        return slotTotal >= sTotal && slotTotal < eTotal;
      })
    )
      return true;

    // Check inCartSlots
    return inCartSlots.some((slot) => {
      const sDate = normalizeFromUTC(slot.date);
      if (!isSameDay(sDate, date)) return false;

      const [sH, sM] = slot.startTime.split(":").map(Number);
      const [eH, eM] = slot.endTime.split(":").map(Number);

      const sTotal = sH * 60 + sM;
      const eTotal = eH * 60 + eM;

      return slotTotal >= sTotal && slotTotal < eTotal;
    });
  };

  const handleSlotClick = (date: Date, hour: number, minute: number) => {
    // Determine requested start and end times
    const startTotal = hour * 60 + minute;
    const duration = durationMinutes;
    const endTotal = startTotal + duration;

    // Check if we are interacting with an already selected slot
    const existingSlot = selectedSlots.find((slot) => {
      const sDate = normalizeFromUTC(slot.date);
      if (!isSameDay(sDate, date)) return false;
      const [sH, sM] = slot.startTime.split(":").map(Number);
      return sH === hour && sM === minute;
    });

    if (existingSlot) {
      if (onRemoveSlot) {
        onRemoveSlot(existingSlot);
      }
      return;
    }

    // Check if we are interacting with a slot already in cart (Prevent selection/interaction)
    const inCart = inCartSlots.some((slot) => {
      const sDate = normalizeFromUTC(slot.date);
      if (!isSameDay(sDate, date)) return false;
      const [sH, sM] = slot.startTime.split(":").map(Number);
      return sH === hour && sM === minute;
    });

    if (inCart) {
      // Optional: Alert user
      return;
    }

    // INTERVAL CHECK: Robust Availability
    const dateKey = format(date, "yyyy-MM-dd");
    const intervals = dailyIntervalsMap.get(dateKey) || [];

    // Check if the requested range [startTotal, endTotal] fits in ANY merged interval
    const isFits = intervals.some(
      (iv) => startTotal >= iv.start && endTotal <= iv.end,
    );

    if (!isFits) {
      return;
    }

    // Check if we are at max slots - if so, REPLACE the last selected slot
    if (selectedSlots.length >= maxSlots) {
      // For single-slot packages, replace the existing selection
      // For multi-slot packages, replace the most recent selection
      const slotToRemove = selectedSlots[selectedSlots.length - 1];
      if (slotToRemove && onRemoveSlot) {
        onRemoveSlot(slotToRemove);
      }
      // Continue to add the new slot below
    }

    // Create the booking slot
    // We construct a NEW slot object for the specific selection
    const selectedStartTime = formatTime24(hour, minute);
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;
    const selectedEndTime = formatTime24(endH, endM);

    const newSlot: TimeSlot = {
      date: date,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
    };

    onSelectSlot(newSlot);
  };

  if (!isMounted) return null;

  const isComplete =
    selectedSlots.length >= maxSlots || (!!selectedSlot && maxSlots === 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-xl border-gray-200 shadow-2xl rounded-xl flex flex-col">
        {/* Header */}
        <div className="flex-none p-6 border-b border-gray-100 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[hsl(var(--golf-orange))]/10 rounded-lg text-[hsl(var(--golf-orange))]">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Pick a Time {programName ? `— ${programName}` : ""}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Select {maxSlots > 1 ? `up to ${maxSlots}` : "an"} available
                time slot{maxSlots > 1 ? "s" : ""} • Timezone: EST
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* View Toggle */}
            <div className="flex items-center p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                  viewMode === "calendar"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                <GridIcon className="w-4 h-4" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                <ListIcon className="w-4 h-4" />
                List
              </button>
            </div>

            {/* Actions / Legend (Only show appropriate legend for view) */}
            <div className="flex items-center gap-4 text-sm text-gray-500 hidden lg:flex">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[hsl(var(--golf-green))] rounded-sm"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border border-gray-200 rounded-sm"></div>
                <span>Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {viewMode === "calendar" ? (
            /* --- CALENDAR VIEW --- */
            <div className="flex-1 flex flex-col bg-gray-50/50 min-w-0">
              {/* Nav */}
              <div className="flex-none flex items-center justify-between px-6 py-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeekStart((d) => addDays(d, -7))}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-gray-700 bg-white px-4 py-1.5 rounded-full border shadow-sm">
                  {format(currentWeekStart, "MMMM yyyy")}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeekStart((d) => addDays(d, 7))}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Scrollable Area */}
              <div className="flex-1 overflow-auto px-6 pb-6 relative">
                <div
                  className={cn(
                    "bg-white rounded-xl border shadow-sm overflow-hidden min-w-[800px] transition-all duration-300",
                    isComplete ? "border-red-500 ring-4 ring-red-50" : "",
                  )}
                >
                  {/* Week Header */}
                  <div className="grid grid-cols-8 border-b divide-x sticky top-0 bg-white z-10">
                    <div className="p-3 text-xs font-semibold text-gray-400 text-center uppercase tracking-wider bg-gray-50/50">
                      Time
                    </div>
                    {weekDays.map((day) => {
                      const todayEST = getNowEST();
                      const isToday = isSameDay(day, todayEST);
                      return (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            "p-3 text-center transition-colors",
                            isToday
                              ? "bg-[hsl(var(--golf-orange))]/5"
                              : "bg-gray-50/50",
                          )}
                        >
                          <div
                            className={cn(
                              "text-xs font-bold uppercase mb-1",
                              isToday
                                ? "text-[hsl(var(--golf-orange))]"
                                : "text-gray-500",
                            )}
                          >
                            {format(day, "EEE")}
                          </div>
                          <div
                            className={cn(
                              "text-lg font-medium w-8 h-8 rounded-full flex items-center justify-center mx-auto",
                              isToday
                                ? "bg-[hsl(var(--golf-orange))] text-white shadow-md"
                                : "text-gray-900",
                            )}
                          >
                            {format(day, "d")}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Slots */}
                  <div className="divide-y relative select-none">
                    {dailySlots.map(({ hour, minute }) => (
                      <div
                        key={`${hour}-${minute}`}
                        className="grid grid-cols-8 divide-x hover:bg-gray-50/30 transition-colors"
                      >
                        {/* Time Label */}
                        <div className="p-2 text-xs text-gray-500 text-center flex items-center justify-center font-medium border-l-4 border-l-transparent">
                          {formatTime(hour, minute)}
                        </div>

                        {/* Days */}
                        {weekDays.map((day) => {
                          const id = getSlotId(day, hour, minute);
                          const isAvailable = availableSlotIds.has(id);
                          // "isPartOfSelection" means this slot falls within the range of a selected booking (Green Block)
                          const isPartOfSelection = isTimeSelected(
                            day,
                            hour,
                            minute,
                          );

                          // "isExactStart" means this is the specific time the user clicked (The "Head" of the booking)
                          const isExactStart = selectedSlots.some((slot) => {
                            const sDate = normalizeFromUTC(slot.date);
                            if (!isSameDay(sDate, day)) return false;
                            const [sH, sM] = slot.startTime
                              .split(":")
                              .map(Number);
                            return sH === hour && sM === minute;
                          });

                          // Check sufficiency / Interval fit (Robust)
                          let isInsufficient = false;

                          if (isAvailable) {
                            const startTotal = hour * 60 + minute;
                            const endTotal = startTotal + durationMinutes;

                            const dateKey = format(day, "yyyy-MM-dd");
                            const intervals =
                              dailyIntervalsMap.get(dateKey) || [];

                            // Check if it fits in any interval
                            const isFits = intervals.some(
                              (iv) =>
                                startTotal >= iv.start && endTotal <= iv.end,
                            );

                            if (!isFits) {
                              isInsufficient = true;
                            }
                          }

                          // Check for overlap with other selected slots
                          // But we DO want to disable it if it overlaps but isn't part of the intentionally selected block
                          // (Wait, isTimeSelected handles "part of selected block").
                          // So we strictly check "Does this NEW potential selection overlap an EXISTING selection?"
                          // If it overlaps, and it is NOT part of the currently selected blocks, then block it.
                          let isOverlap = false;
                          if (
                            isAvailable &&
                            !isInsufficient &&
                            !isPartOfSelection
                          ) {
                            const currentStartTotal = hour * 60 + minute;
                            const currentEndTotal =
                              currentStartTotal + durationMinutes;

                            isOverlap =
                              selectedSlots.some((slot) => {
                                const sDate = normalizeFromUTC(slot.date);
                                if (!isSameDay(sDate, day)) return false;

                                const [sH, sM] = slot.startTime
                                  .split(":")
                                  .map(Number);
                                const [sEndH, sEndM] = slot.endTime
                                  .split(":")
                                  .map(Number);

                                const sStartTotal = sH * 60 + sM;
                                const sEndTotal = sEndH * 60 + sEndM;

                                // Overlap condition
                                return (
                                  currentStartTotal < sEndTotal &&
                                  currentEndTotal > sStartTotal
                                );
                              }) ||
                              inCartSlots.some((slot) => {
                                const sDate = normalizeFromUTC(slot.date);
                                if (!isSameDay(sDate, day)) return false;

                                const [sH, sM] = slot.startTime
                                  .split(":")
                                  .map(Number);
                                const [sEndH, sEndM] = slot.endTime
                                  .split(":")
                                  .map(Number);

                                const sStartTotal = sH * 60 + sM;
                                const sEndTotal = sEndH * 60 + sEndM;

                                // Overlap condition
                                return (
                                  currentStartTotal < sEndTotal &&
                                  currentEndTotal > sStartTotal
                                );
                              });
                          }

                          // Green Hover Logic (for valid slots - fills entire duration)
                          let isHovered = false;
                          if (hoveredSlot && isAvailable) {
                            if (isSameDay(day, hoveredSlot.date)) {
                              const currentTotal = hour * 60 + minute;
                              const [hStart, mStart] = hoveredSlot.startTime
                                .split(":")
                                .map(Number);
                              const startTotal = hStart * 60 + mStart;
                              const endTotal = startTotal + durationMinutes;

                              // Highlight all cells in the duration range
                              if (
                                currentTotal >= startTotal &&
                                currentTotal < endTotal
                              ) {
                                isHovered = true;
                              }
                            }
                          }

                          // Red/Blocked Hover Logic (for insufficient or overlapping slots)
                          let isBlockedHovered = false;
                          if (
                            blockedHoverSlot &&
                            isSameDay(day, blockedHoverSlot.date)
                          ) {
                            const currentTotal = hour * 60 + minute;
                            const [hStart, mStart] = blockedHoverSlot.startTime
                              .split(":")
                              .map(Number);
                            const startTotal = hStart * 60 + mStart;
                            const endTotal = startTotal + durationMinutes;

                            if (
                              currentTotal >= startTotal &&
                              currentTotal < endTotal
                            ) {
                              isBlockedHovered = true;
                            }
                          }

                          const allow =
                            isAvailable && !isInsufficient && !isOverlap;
                          // Determine if this slot is blocked (insufficient OR overlapping)
                          // Note: capacity blocking is handled by replacement logic, so we don't block for that.
                          const isBlocked =
                            isAvailable && (isInsufficient || isOverlap);

                          return (
                            <div
                              key={id}
                              onClick={() => {
                                // Clear hover states immediately to prevent "gray ghosts"
                                setHoveredSlot(null);
                                setBlockedHoverSlot(null);

                                // Allow clicking on START of selection (to toggle/remove)
                                // OR allow clicking on valid NEW slots
                                // PREVENT clicking on "tail" slots (isPartOfSelection but !isExactStart)
                                if (
                                  isExactStart ||
                                  (allow && !isPartOfSelection)
                                ) {
                                  handleSlotClick(day, hour, minute);
                                }
                              }}
                              onMouseEnter={() => {
                                const sTime = formatTime24(hour, minute);

                                if (isAvailable && isBlocked) {
                                  // Show red hover for blocked slots
                                  setBlockedHoverSlot({
                                    date: day,
                                    startTime: sTime,
                                    endTime: "",
                                  });
                                  setHoveredSlot(null);
                                } else if (allow && !isPartOfSelection) {
                                  // Show green hover for valid slots
                                  // Don't show hover over existing selection
                                  setHoveredSlot({
                                    date: day,
                                    startTime: sTime,
                                    endTime: "",
                                  });
                                  setBlockedHoverSlot(null);
                                } else {
                                  setHoveredSlot(null);
                                  setBlockedHoverSlot(null);
                                }
                              }}
                              onMouseLeave={() => {
                                setHoveredSlot(null);
                                setBlockedHoverSlot(null);
                              }}
                              className={cn(
                                "h-10 transition-all duration-100 flex items-center justify-center cursor-pointer border-t border-transparent p-0.5",

                                // Unavailable styling (not available at all)
                                !isAvailable
                                  ? "bg-gray-100 cursor-not-allowed opacity-60"
                                  : "",

                                // Blocked hover styling (red for entire duration span)
                                isBlockedHovered
                                  ? "bg-red-100 cursor-not-allowed"
                                  : "",

                                // Visual Blocked State (Gray out overlapping slots that aren't selected)
                                isOverlap && !isBlockedHovered
                                  ? "bg-gray-100/50 cursor-not-allowed"
                                  : "",

                                // Normal available slot - show green hover hint
                                isAvailable &&
                                  !isPartOfSelection &&
                                  !isHovered &&
                                  !isBlockedHovered &&
                                  !isBlocked
                                  ? "hover:bg-green-50"
                                  : "",

                                // Selected styling (Green background for whole block)
                                isPartOfSelection
                                  ? "bg-[hsl(var(--golf-green))] text-white hover:bg-[hsl(var(--golf-green))]"
                                  : "",

                                // Green hover for valid slots
                                !isPartOfSelection &&
                                  isHovered &&
                                  isAvailable &&
                                  !isBlockedHovered
                                  ? "bg-green-100/70 shadow-inner"
                                  : "",
                              )}
                            >
                              {isExactStart && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- LIST VIEW --- */
            <div className="flex-1 flex flex-col bg-gray-50/50 min-w-0 overflow-hidden">
              <div className="flex-1 overflow-auto p-6">
                <div className="max-w-3xl mx-auto space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    {sortedAvailableDates.map((dateKey) => {
                      const date = parseISO(dateKey);
                      const displayDate = new Date(
                        date.getUTCFullYear(),
                        date.getUTCMonth(),
                        date.getUTCDate(),
                      );

                      // Calculate available slots for this date
                      const availableTimesForDay = [];
                      const intervals = dailyIntervalsMap.get(dateKey) || [];

                      // Iterate through all 30-min slots in the day
                      // We can reuse getDailySlotTimes or just loop
                      for (
                        let t = START_HOUR * 60;
                        t < END_HOUR * 60;
                        t += 30
                      ) {
                        const startTotal = t;
                        const endTotal = startTotal + durationMinutes;

                        // Check if fits in interval
                        const fits = intervals.some(
                          (iv) => startTotal >= iv.start && endTotal <= iv.end,
                        );

                        if (fits) {
                          const h = Math.floor(t / 60);
                          const m = t % 60;
                          availableTimesForDay.push({ h, m });
                        }
                      }

                      if (availableTimesForDay.length === 0) return null;

                      return (
                        <AccordionItem
                          key={dateKey}
                          value={dateKey}
                          className="bg-white border rounded-xl shadow-sm mb-3 px-4 last:mb-0"
                        >
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-4">
                              <div className="text-left">
                                <p className="font-bold text-lg text-gray-900">
                                  {format(displayDate, "EEEE, MMMM d, yyyy")}
                                </p>
                                <p className="text-sm text-gray-500 font-medium">
                                  {availableTimesForDay.length} available times
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-6 pt-2">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                              {availableTimesForDay.map(({ h, m }) => {
                                const currentStartTotal = h * 60 + m;
                                const currentEndTotal =
                                  currentStartTotal + durationMinutes;

                                let isSelected = false;
                                let isOverlap = false;

                                // Check in-cart status first
                                let isInCart = false;
                                inCartSlots.forEach((slot) => {
                                  const sDate = normalizeFromUTC(slot.date);
                                  if (!isSameDay(sDate, displayDate)) return;
                                  const [sH, sM] = slot.startTime
                                    .split(":")
                                    .map(Number);
                                  if (sH === h && sM === m) isInCart = true;
                                });

                                selectedSlots.forEach((slot) => {
                                  const sDate = normalizeFromUTC(slot.date);
                                  if (!isSameDay(sDate, displayDate)) return;

                                  const [sH, sM] = slot.startTime
                                    .split(":")
                                    .map(Number);
                                  const [sEndH, sEndM] = slot.endTime
                                    .split(":")
                                    .map(Number);

                                  // Check for exact match (Selected)
                                  if (sH === h && sM === m) {
                                    isSelected = true;
                                    return;
                                  }

                                  // Check for overlap (Disabled)
                                  const sStartTotal = sH * 60 + sM;
                                  const sEndTotal = sEndH * 60 + sEndM;

                                  // Overlap condition: StartA < EndB && EndA > StartB
                                  if (
                                    currentStartTotal < sEndTotal &&
                                    currentEndTotal > sStartTotal
                                  ) {
                                    isOverlap = true;
                                  }
                                });

                                // Check for overlap with Cart Slots
                                if (!isOverlap) {
                                  inCartSlots.forEach((slot) => {
                                    const sDate = normalizeFromUTC(slot.date);
                                    if (!isSameDay(sDate, displayDate)) return;

                                    const [sH, sM] = slot.startTime
                                      .split(":")
                                      .map(Number);
                                    const [sEndH, sEndM] = slot.endTime
                                      .split(":")
                                      .map(Number);

                                    const sStartTotal = sH * 60 + sM;
                                    const sEndTotal = sEndH * 60 + sEndM;

                                    if (
                                      currentStartTotal < sEndTotal &&
                                      currentEndTotal > sStartTotal
                                    ) {
                                      isOverlap = true;
                                    }
                                  });
                                }

                                return (
                                  <button
                                    key={`${h}-${m}`}
                                    onClick={() => {
                                      // Check overlap or in cart
                                      let isInCart = false;
                                      inCartSlots.forEach((s) => {
                                        if (
                                          !isSameDay(
                                            normalizeFromUTC(s.date),
                                            displayDate,
                                          )
                                        )
                                          return;
                                        const [sH, sM] = s.startTime
                                          .split(":")
                                          .map(Number);
                                        if (sH === h && sM === m)
                                          isInCart = true;
                                      });

                                      if (!isOverlap && !isInCart) {
                                        handleSlotClick(displayDate, h, m);
                                      }
                                    }}
                                    disabled={isOverlap}
                                    className={cn(
                                      "px-2 py-3 rounded-lg text-sm font-bold border-2 transition-all shadow-sm cursor-pointer",
                                      isSelected
                                        ? "bg-[hsl(var(--golf-green))] border-[hsl(var(--golf-green))] text-white shadow-md transform scale-105"
                                        : isInCart
                                          ? "bg-[hsl(var(--golf-green))]/80 border-[hsl(var(--golf-green))] text-white shadow-md cursor-default opacity-80"
                                          : isOverlap
                                            ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                                            : "bg-white border-gray-100 text-gray-700 hover:border-green-300 hover:bg-green-50 hover:shadow-md",
                                    )}
                                  >
                                    {formatTime(h, m)}
                                  </button>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>

                  {sortedAvailableDates.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        No available dates found. Please try again later.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sidebar */}
          <div className="w-80 border-l bg-white flex flex-col z-20 shadow-xl">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-lg text-gray-900">
                  Selected Times
                </h3>
                <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                  {selectedSlots.length || (selectedSlot ? 1 : 0)} / {maxSlots}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm",
                  isComplete ? "text-red-600 font-semibold" : "text-gray-500",
                )}
              >
                {isComplete
                  ? `All ${maxSlots} session(s) have been scheduled. Please confirm selection.`
                  : `Please select ${maxSlots - (selectedSlots?.length || 0)} more slot${maxSlots - (selectedSlots?.length || 0) !== 1 ? "s" : ""}`}
              </p>
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-auto">
              {/* Support both legacy single selectedSlot and new selectedSlots array */}
              {selectedSlots.length > 0 || selectedSlot ? (
                <>
                  {selectedSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border-2 border-[hsl(var(--golf-green))] bg-[hsl(var(--golf-green))]/5 relative group"
                    >
                      <button
                        onClick={() => onRemoveSlot && onRemoveSlot(slot)}
                        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-white bg-red-500 shadow-sm hover:bg-red-600 rounded-full transition-all cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[hsl(var(--golf-green))] rounded-lg text-white">
                          <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {format(normalizeFromUTC(slot.date), "EEEE, MMM d")}
                          </p>
                          <p className="font-medium text-[hsl(var(--golf-green))] text-base mt-0.5">
                            {formatTime12(slot.startTime)} -{" "}
                            {formatTime12(slot.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedSlot && selectedSlots.length === 0 && (
                    <div className="p-4 rounded-xl border-2 border-[hsl(var(--golf-green))] bg-[hsl(var(--golf-green))]/5">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[hsl(var(--golf-green))] rounded-lg text-white">
                          <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {format(
                              normalizeFromUTC(selectedSlot.date),
                              "EEEE, MMM d",
                            )}
                          </p>
                          <p className="font-medium text-[hsl(var(--golf-green))] text-base mt-0.5">
                            {formatTime12(selectedSlot.startTime)} -{" "}
                            {formatTime12(selectedSlot.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-xl border-gray-200">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No time selected.</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Click a white slot on the grid.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <Button
                className="w-full h-12 text-base font-bold bg-[hsl(var(--golf-orange))] hover:bg-[hsl(var(--golf-orange))]/90 text-white shadow-lg shadow-orange-500/20"
                disabled={!isComplete}
                onClick={() => onOpenChange(false)}
              >
                Confirm Selection (
                {selectedSlots.length || (selectedSlot ? 1 : 0)})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
