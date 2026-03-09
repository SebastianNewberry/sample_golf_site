"use client";

import { useState, useMemo, useEffect } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
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

const START_HOUR = 8;
const END_HOUR = 22;

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter available slots to exclude past times in EST
  const filteredAvailableSlots = useMemo(() => {
    const nowEST = getNowEST();

    return availableSlots.filter((slot) => {
      // 1. Normalize Date
      const slotDate = normalizeFromUTC(slot.date);

      // 2. set Hours/Minutes from slot string (HH:mm)
      const [h, m] = slot.startTime.split(":").map(Number);
      slotDate.setHours(h, m, 0, 0);

      // 3. Compare with nowEST
      // We want slots that are AFTER now
      return slotDate > nowEST;
    });
  }, [availableSlots]);

  // Map of Available Intervals per Day (Merged)
  const dailyIntervalsMap = useMemo(() => {
    const map = new Map<string, Array<{ start: number; end: number }>>();

    filteredAvailableSlots.forEach((slot) => {
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
  }, [filteredAvailableSlots]);

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
      // PREVIOUS LOGIC (Commented out as per user request):
      // For single-slot packages, replace the existing selection
      // For multi-slot packages, replace the most recent selection
      /*
      const slotToRemove = selectedSlots[selectedSlots.length - 1];
      if (slotToRemove && onRemoveSlot) {
        onRemoveSlot(slotToRemove);
      }
      */
      // NEW LOGIC: Just return?
      // Actually, if we disable the buttons in UI, we shouldn't even get here except maybe race condition.
      // But to be safe: do nothing if max reached (unless removing, which is handled above).
      return;
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
  const isMaxReached = selectedSlots.length >= maxSlots;

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

          {/* Legend */}
          <div className="hidden lg:flex items-center gap-4 text-sm text-gray-500">
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

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* --- LIST VIEW --- */}
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
                    for (let t = START_HOUR * 60; t < END_HOUR * 60; t += 30) {
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
                                      if (sH === h && sM === m) isInCart = true;
                                    });

                                    // NEW: Check if max reached
                                    const limitReached =
                                      selectedSlots.length >= maxSlots;
                                    // If max reached, only allow clicking if it IS already select (to toggle off/remove)
                                    // But wait, the remove logic for list view is... actually this button doesn't handle remove directly?
                                    // Let's check handleSlotClick. It DOES handle remove.
                                    // So if isSelected, we allow click.
                                    // If !isSelected and limitReached, we disable.

                                    if (
                                      !isOverlap &&
                                      !isInCart &&
                                      (!limitReached || isSelected)
                                    ) {
                                      handleSlotClick(displayDate, h, m);
                                    }
                                  }}
                                  disabled={
                                    isOverlap ||
                                    (selectedSlots.length >= maxSlots &&
                                      !isSelected)
                                  }
                                  className={cn(
                                    "px-2 py-3 rounded-lg text-sm font-bold border-2 transition-all shadow-sm cursor-pointer",
                                    isSelected
                                      ? "bg-[hsl(var(--golf-green))] border-[hsl(var(--golf-green))] text-white shadow-md transform scale-105"
                                      : isInCart
                                        ? "bg-[hsl(var(--golf-green))]/80 border-[hsl(var(--golf-green))] text-white shadow-md cursor-default opacity-80"
                                        : isOverlap ||
                                            (selectedSlots.length >= maxSlots &&
                                              !isSelected)
                                          ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed" // Disabled style
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

          {/* Sidebar */}
          <div className="w-full md:w-80 md:border-l border-t md:border-t-0 bg-white flex flex-col z-20 shadow-xl">
            {/* Desktop sidebar (always visible) */}
            <div className="hidden md:flex md:flex-col md:flex-1">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    Selected Times
                  </h3>
                  <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                    {selectedSlots.length || (selectedSlot ? 1 : 0)} /{" "}
                    {maxSlots}
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
                              {format(
                                normalizeFromUTC(slot.date),
                                "EEEE, MMM d",
                              )}
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
                  <div className="text-center py-6 border-2 border-dashed rounded-xl border-gray-200">
                    <Clock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No time selected.</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Select an available time from the list.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile sidebar (collapsible accordion) */}
            <div className="md:hidden">
              <Accordion type="single" collapsible>
                <AccordionItem value="selected-times" className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3 w-full">
                      <h3 className="font-bold text-base text-gray-900">
                        Selected Times
                      </h3>
                      <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                        {selectedSlots.length || (selectedSlot ? 1 : 0)} /{" "}
                        {maxSlots}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3">
                    <p
                      className={cn(
                        "text-xs mb-3",
                        isComplete
                          ? "text-red-600 font-semibold"
                          : "text-gray-500",
                      )}
                    >
                      {isComplete
                        ? `All ${maxSlots} session(s) scheduled. Confirm below.`
                        : `Select ${maxSlots - (selectedSlots?.length || 0)} more slot${maxSlots - (selectedSlots?.length || 0) !== 1 ? "s" : ""}`}
                    </p>
                    <div className="space-y-3 max-h-[140px] overflow-y-auto">
                      {selectedSlots.length > 0 || selectedSlot ? (
                        <>
                          {selectedSlots.map((slot, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg border-2 border-[hsl(var(--golf-green))] bg-[hsl(var(--golf-green))]/5 relative"
                            >
                              <button
                                onClick={() =>
                                  onRemoveSlot && onRemoveSlot(slot)
                                }
                                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-white bg-red-500 shadow-sm hover:bg-red-600 rounded-full transition-all cursor-pointer"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-[hsl(var(--golf-green))] rounded-md text-white">
                                  <CalendarIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">
                                    {format(
                                      normalizeFromUTC(slot.date),
                                      "EEE, MMM d",
                                    )}
                                  </p>
                                  <p className="font-medium text-[hsl(var(--golf-green))] text-xs">
                                    {formatTime12(slot.startTime)} –{" "}
                                    {formatTime12(slot.endTime)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {selectedSlot && selectedSlots.length === 0 && (
                            <div className="p-3 rounded-lg border-2 border-[hsl(var(--golf-green))] bg-[hsl(var(--golf-green))]/5">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-[hsl(var(--golf-green))] rounded-md text-white">
                                  <CalendarIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">
                                    {format(
                                      normalizeFromUTC(selectedSlot.date),
                                      "EEE, MMM d",
                                    )}
                                  </p>
                                  <p className="font-medium text-[hsl(var(--golf-green))] text-xs">
                                    {formatTime12(selectedSlot.startTime)} –{" "}
                                    {formatTime12(selectedSlot.endTime)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-3 border border-dashed rounded-lg border-gray-200">
                          <Clock className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                          <p className="text-gray-400 text-xs">
                            No time selected.
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="p-4 md:p-6 border-t bg-gray-50">
              <Button
                className="w-full h-10 md:h-12 text-sm md:text-base font-bold bg-[hsl(var(--golf-orange))] hover:bg-[hsl(var(--golf-orange))]/90 text-white shadow-lg shadow-orange-500/20"
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
