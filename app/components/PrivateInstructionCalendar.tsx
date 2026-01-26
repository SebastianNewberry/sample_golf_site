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
} from "lucide-react";
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
}

// --- Constants ---
const SLOT_DURATION_MINUTES = 30;
const START_HOUR = 8; // Assuming lessons start around 8am
const END_HOUR = 20; // Until 8pm
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
  durationMinutes,
  maxSlots = 1,
  selectedSlot, // Keep for backward compat if needed, but prefer selectedSlots
}: PrivateInstructionCalendarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [hoveredSlot, setHoveredSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    const nowEST = getNowEST();
    setCurrentWeekStart(startOfWeek(nowEST, { weekStartsOn: 1 }));
    setIsMounted(true);
  }, []);

  const dailySlots = useMemo(() => getDailySlotTimes(), []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // Map of Available Slot IDs
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
    return selectedSlots.some((slot) => {
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
    const id = getSlotId(date, hour, minute);
    if (!availableSlotIds.has(id)) return;

    // Determine requested start and end times
    const startTotal = hour * 60 + minute;
    const duration = durationMinutes || 60; // Default to 60 if missing
    const endTotal = startTotal + duration;

    // Check availability for the ENTIRE duration
    // We check every 30-minute block that falls within this range
    let isFullyAvailable = true;
    for (let t = startTotal; t < endTotal; t += 30) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      const checkId = getSlotId(date, h, m);
      if (!availableSlotIds.has(checkId)) {
        isFullyAvailable = false;
        break;
      }
    }

    if (!isFullyAvailable) {
      return;
    }

    // Check if we are at max slots (if maxSlots > 1)
    if (selectedSlots.length >= maxSlots && maxSlots > 1) {
      // If clicking an already selected slot (start time match), maybe remove it?
      // But keeping it simple: prevent adding if full.
      // Ideally we'd have a remove function passed to the grid too, but sidebar is simpler.
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

  // Helper for 24h format
  const formatTime24 = (h: number, m: number) =>
    `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  if (!isMounted) return null;

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

          {/* Actions / Legend */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[hsl(var(--golf-green))] rounded-sm"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border border-gray-200 rounded-sm"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Calendar Grid */}
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
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-w-[800px]">
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
                        const isSelected = isTimeSelected(day, hour, minute);

                        // Hover Logic
                        let isHovered = false;
                        if (hoveredSlot && isAvailable) {
                          // Check if this slot is part of the hovered range
                          // We need to check if it's on the same day first
                          if (isSameDay(day, hoveredSlot.date)) {
                            const currentTotal = hour * 60 + minute;
                            const [hStart, mStart] = hoveredSlot.startTime
                              .split(":")
                              .map(Number);
                            const startTotal = hStart * 60 + mStart;
                            const endTotal =
                              startTotal + (durationMinutes || 60);

                            if (
                              currentTotal >= startTotal &&
                              currentTotal < endTotal
                            ) {
                              isHovered = true;
                            }
                          }
                        }

                        return (
                          <div
                            key={id}
                            onClick={() =>
                              isAvailable && handleSlotClick(day, hour, minute)
                            }
                            onMouseEnter={() => {
                              if (isAvailable) {
                                const sTime = formatTime24(hour, minute);
                                setHoveredSlot({
                                  date: day,
                                  startTime: sTime,
                                  endTime: "", // Not needed for hover check source
                                });
                              } else {
                                setHoveredSlot(null);
                              }
                            }}
                            onMouseLeave={() => setHoveredSlot(null)}
                            className={cn(
                              "h-10 transition-all duration-100 flex items-center justify-center cursor-pointer border-t border-transparent p-0.5",
                              !isAvailable
                                ? "bg-gray-100 cursor-not-allowed opacity-60 pattern-diagonal-lines"
                                : "",
                              isAvailable && !isSelected && !isHovered
                                ? "hover:bg-green-50"
                                : "",
                              isSelected
                                ? "bg-[hsl(var(--golf-green))] text-white hover:bg-[hsl(var(--golf-green))]"
                                : "",
                              !isSelected && isHovered && isAvailable
                                ? "bg-green-100/70 shadow-inner"
                                : "",
                            )}
                          >
                            {isSelected && (
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
              <p className="text-sm text-gray-500">
                {selectedSlots.length === maxSlots ||
                (selectedSlot && maxSlots === 1)
                  ? "Selection complete!"
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
                        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
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
                            {slot.startTime} - {slot.endTime}
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
                            {selectedSlot.startTime} - {selectedSlot.endTime}
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
                disabled={selectedSlots.length === 0 && !selectedSlot}
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
