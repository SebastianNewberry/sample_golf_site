"use client";

import { useState, useMemo, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

export interface SeriesSlot {
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export interface SlotCapacity {
  enrolled: number;
  capacity: number;
}

export interface SeriesCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSlots: SeriesSlot[];
  onSelectSlot: (slot: SeriesSlot) => void;
  onRemoveSlot?: (slot: SeriesSlot) => void;
  selectedSlots?: SeriesSlot[];
  programName?: string;
  maxSlots?: number;
  inCartSlots?: SeriesSlot[];
  /** Per-slot capacity info: key is "YYYY-MM-DD|HH:MM" */
  slotCapacities?: Record<string, SlotCapacity>;
}

const formatTime12 = (time24: string) => {
  const [h, m] = time24.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return format(d, "h:mm a");
};

export function SeriesCalendar({
  open,
  onOpenChange,
  availableSlots,
  onSelectSlot,
  onRemoveSlot,
  selectedSlots = [],
  programName,
  maxSlots = 1,
  inCartSlots = [],
  slotCapacities = {},
}: SeriesCalendarProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter out past dates
  const filteredSlots = useMemo(() => {
    const now = new Date();
    const nowEST = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" }),
    );

    return availableSlots.filter((slot) => {
      const [h, m] = slot.startTime.split(":").map(Number);
      const slotDate = new Date(slot.date + "T00:00:00");
      slotDate.setHours(h, m, 0, 0);
      return slotDate > nowEST;
    });
  }, [availableSlots]);

  // Sort by date
  const sortedSlots = useMemo(() => {
    return [...filteredSlots].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [filteredSlots]);

  const isComplete = selectedSlots.length >= maxSlots;

  const handleSlotClick = (slot: SeriesSlot) => {
    // Check if already selected
    const isSelected = selectedSlots.some(
      (s) => s.date === slot.date && s.startTime === slot.startTime,
    );

    if (isSelected) {
      onRemoveSlot?.(slot);
      return;
    }

    // Check if in cart
    const isInCart = inCartSlots.some(
      (s) => s.date === slot.date && s.startTime === slot.startTime,
    );
    if (isInCart) return;

    // Check capacity
    const key = `${slot.date}|${slot.startTime}`;
    const cap = slotCapacities[key];
    if (cap && cap.enrolled >= cap.capacity) return;

    // Check if max reached
    if (selectedSlots.length >= maxSlots) return;

    onSelectSlot(slot);
  };

  if (!isMounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-xl border-gray-200 shadow-2xl rounded-xl flex flex-col">
        {/* Header */}
        <div className="flex-none p-6 border-b border-gray-100 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-900">
                Pick Your Sessions {programName ? `— ${programName}` : ""}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Select {maxSlots > 1 ? `${maxSlots}` : "a"} session date
                {maxSlots > 1 ? "s" : ""} from the available schedule
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div>
              <span>Full</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Slots List */}
          <div className="flex-1 flex flex-col bg-gray-50/50 min-w-0 overflow-hidden">
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto space-y-3">
                {sortedSlots.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No available sessions found. Please check back later.
                    </p>
                  </div>
                )}

                {sortedSlots.map((slot) => {
                  const key = `${slot.date}|${slot.startTime}`;
                  const cap = slotCapacities[key];
                  const isFull = cap ? cap.enrolled >= cap.capacity : false;
                  const spotsLeft = cap
                    ? cap.capacity - cap.enrolled
                    : undefined;

                  const isSelected = selectedSlots.some(
                    (s) =>
                      s.date === slot.date &&
                      s.startTime === slot.startTime,
                  );

                  const isInCart = inCartSlots.some(
                    (s) =>
                      s.date === slot.date &&
                      s.startTime === slot.startTime,
                  );

                  const isDisabled =
                    isFull ||
                    isInCart ||
                    (selectedSlots.length >= maxSlots && !isSelected);

                  const displayDate = parseISO(slot.date);

                  return (
                    <button
                      key={key}
                      onClick={() => handleSlotClick(slot)}
                      disabled={isDisabled && !isSelected}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between gap-4",
                        isSelected
                          ? "bg-[hsl(var(--golf-green))]/10 border-[hsl(var(--golf-green))] shadow-md"
                          : isInCart
                            ? "bg-blue-50 border-blue-200 opacity-70 cursor-default"
                            : isFull
                              ? "bg-red-50 border-red-200 opacity-60 cursor-not-allowed"
                              : isDisabled
                                ? "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed"
                                : "bg-white border-gray-100 hover:border-green-300 hover:bg-green-50 hover:shadow-md cursor-pointer",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex flex-col items-center justify-center text-sm font-bold",
                            isSelected
                              ? "bg-[hsl(var(--golf-green))] text-white"
                              : isFull
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-700",
                          )}
                        >
                          <span className="text-[10px] uppercase leading-none">
                            {format(displayDate, "MMM")}
                          </span>
                          <span className="text-lg leading-none mt-0.5">
                            {format(displayDate, "d")}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {format(displayDate, "EEEE, MMMM d, yyyy")}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime12(slot.startTime)} —{" "}
                            {formatTime12(slot.endTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Capacity badge */}
                        {cap && (
                          <div
                            className={cn(
                              "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
                              isFull
                                ? "bg-red-100 text-red-700"
                                : spotsLeft !== undefined && spotsLeft <= 2
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700",
                            )}
                          >
                            <Users className="w-3 h-3" />
                            {isFull
                              ? "Full"
                              : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
                          </div>
                        )}

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[hsl(var(--golf-green))] flex items-center justify-center">
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}

                        {isInCart && (
                          <span className="text-xs text-blue-600 font-medium">
                            In Cart
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-80 md:border-l border-t md:border-t-0 bg-white flex flex-col min-h-0 z-20 shadow-xl overflow-hidden">
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    Selected Sessions
                  </h3>
                  <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                    {selectedSlots.length} / {maxSlots}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm",
                    isComplete
                      ? "text-red-600 font-semibold"
                      : "text-gray-500",
                  )}
                >
                  {isComplete
                    ? `All ${maxSlots} session(s) selected. Confirm below.`
                    : `Select ${maxSlots - selectedSlots.length} more session${maxSlots - selectedSlots.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              <div className="flex-1 p-6 space-y-3 overflow-y-auto min-h-0">
                {selectedSlots.length > 0 ? (
                  selectedSlots.map((slot, idx) => {
                    const displayDate = parseISO(slot.date);
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border-2 border-[hsl(var(--golf-green))] bg-[hsl(var(--golf-green))]/5 relative group"
                      >
                        <button
                          onClick={() => onRemoveSlot?.(slot)}
                          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-white bg-red-500 shadow-sm hover:bg-red-600 rounded-full transition-all cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div>
                          <p className="font-bold text-gray-900 text-lg pr-10">
                            {format(displayDate, "EEEE, MMM d")}
                          </p>
                          <p className="font-medium text-[hsl(var(--golf-green))] text-base mt-0.5">
                            {formatTime12(slot.startTime)} —{" "}
                            {formatTime12(slot.endTime)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 border-2 border-dashed rounded-xl border-gray-200">
                    <CalendarIcon className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">
                      No sessions selected.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Click on available dates to select them.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 md:p-6 border-t bg-gray-50">
              <Button
                className="w-full h-10 md:h-12 text-sm md:text-base font-bold bg-[hsl(var(--golf-orange))] hover:bg-[hsl(var(--golf-orange))]/90 text-white shadow-lg shadow-orange-500/20"
                disabled={!isComplete}
                onClick={() => onOpenChange(false)}
              >
                Confirm Selection ({selectedSlots.length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
