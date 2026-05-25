"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DiscountSection } from "@/app/components/cart/DiscountSection";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
  Loader2,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import { validateCartAvailability } from "@/app/actions/validation";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { parseSchedule, formatTime12h } from "@/lib/session-schedule";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPrice } from "@/lib/utils";

// Mapping of program IDs to their corresponding images
// Used as fallback when imageUrl is not available from database
const PROGRAM_IMAGE_MAP: Record<string, string> = {
  // Adult Programs
  "583078c5-6e1f-40fc-a1a0-8c1cc88a6d7b": "/golf_ready_level1.webp", // Get Golf Ready Level I
  "eb15499e-b573-4027-a2dc-1335bc7613b1": "/golf_ready_level2.webp", // Get Golf Ready Level II
  "9bc2b2b7-2774-4971-b469-4ce2a8d3a707": "/adult_short_game.webp", // Adult Short Game Series
  "9160a3a8-a652-4ddf-a13f-298336168e04": "/golf_for_women.webp", // Golf for Women
  "f89b62ee-ffda-421d-a525-8bd2a580f24e": "/adult_private_instruction.webp", // Adult Private Golf Instruction
  "0dc3ac70-8346-44c4-9ef6-b638ccbb9082": "/adult_open_practice.webp", // Adult Open Practice

  // Junior Programs
  "0284e4eb-fd96-4626-9009-272b7d985d88": "/junior_beginner_series.webp", // Junior Beginner Series
  "cc6a73ca-95fb-4acb-be01-6cee4ce44475": "/junior_development_series.gif", // Junior Developmental Series
  "8102629d-9ec3-4034-beca-16683db482f2": "/junior_golf_camp.webp", // Junior Golf Camp / Junior Developmental Golf Camp
  "754bf4be-0ef6-4123-b5ff-b107e03c2f10": "/junior_private_instruction.webp", // Junior Private Golf Instruction
};

// Private Instruction Program IDs for special handling
const PRIVATE_INSTRUCTION_IDS = [
  "f89b62ee-ffda-421d-a525-8bd2a580f24e", // Adult
  "754bf4be-0ef6-4123-b5ff-b107e03c2f10", // Junior
];

export default function CartContent() {
  const { items, total, discountAmount, finalTotal, isLoading, removeItem, updateQuantity, clearCart } =
    useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({});
  const [isValidating, setIsValidating] = React.useState(false);

  const validateCart = React.useCallback(async () => {
    setIsValidating(true);
    setValidationErrors({});
    try {
      const result = await validateCartAvailability(items);
      if (!result.valid && result.errors) {
        setValidationErrors(result.errors);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (result.valid && searchParams.get("validate") === "true") {
        // If valid and we were asked to validate (likely from checkout redirect),
        // but now it's valid? Maybe race condition resolved or logic error.
        // We can stay here or push back to checkout?
        // Safest to stay here and let user click proceed again.
      }
      return result.valid;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [items, searchParams]);

  useEffect(() => {
    // Always validate on mount if there are items
    if (items.length > 0) {
      validateCart();
    }
  }, [items.length, validateCart]);

  useEffect(() => {
    if (searchParams.get("validate") === "true" && items.length > 0) {
      validateCart();
    }
  }, [searchParams, items.length, validateCart]);

  const handleProceedToCheckout = async () => {
    if (await validateCart()) {
      router.push("/checkout");
    }
  };

  // Helper function to format session dates for display using Eastern Time
  const formatSessionSchedule = (scheduleJson: unknown) => {
    const schedule = parseSchedule(scheduleJson);
    if (!schedule || schedule.length === 0) {
      return null;
    }

    // Sort by date
    const sortedSchedule = [...schedule].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Helper to parse date string (YYYY-MM-DD) to Date object
    const parseDate = (dateString: string): Date => {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    // Group sessions by day of week and time range
    const groups: Record<string, { day: string; time: string; dates: Date[] }> = {};

    sortedSchedule.forEach((s) => {
      const d = parseDate(s.date);
      const weekday = d.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "America/New_York",
      });
      const timeRange = `${formatTime12h(s.startTime)} - ${formatTime12h(s.endTime)}`;
      const key = `${weekday}-${timeRange}`;

      if (!groups[key]) {
        groups[key] = { day: weekday, time: timeRange, dates: [] };
      }
      groups[key].dates.push(d);
    });

    const sessionGroups = Object.values(groups).map((group) => {
      group.dates.sort((a, b) => a.getTime() - b.getTime());
      const firstDate = group.dates[0];
      const lastDate = group.dates[group.dates.length - 1];

      const formatDateShort = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });

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

    return {
      sessionCount: schedule.length,
      sessionGroups,
    };
  };

  // Helper to format private instruction metadata for display
  const formatPrivateInstructionMetadata = (metadataJson: string | null) => {
    if (!metadataJson) return null;
    try {
      const metadata = JSON.parse(metadataJson);
      if (!metadata.slots || !Array.isArray(metadata.slots)) return null;

      // Parse and group dates from metadata slots
      const groups: Record<string, { day: string; time: string; dates: Date[] }> = {};

      metadata.slots.forEach((slot: any) => {
        const [year, month, day] = slot.date.split("-").map(Number);
        const date = new Date(year, month - 1, day);

        const weekday = date.toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: "America/New_York",
        });
        const timeRange = `${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`;
        const key = `${weekday}-${timeRange}`;

        if (!groups[key]) {
          groups[key] = { day: weekday, time: timeRange, dates: [] };
        }
        groups[key].dates.push(date);
      });

      const formattedGroups = Object.values(groups).map((group) => {
        group.dates.sort((a, b) => a.getTime() - b.getTime());
        const firstDate = group.dates[0];
        const lastDate = group.dates[group.dates.length - 1];

        const formatDateShort = (d: Date) =>
          d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });

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

      return {
        duration: metadata.duration,
        totalHours: metadata.totalHours,
        sessionCount: metadata.slots.length,
        groups: formattedGroups,
        isOnCourse: metadata.isOnCourse,
        coachesCount: metadata.coachesCount,
      };
    } catch (e) {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center mb-8">
              <ShoppingCart className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
              Your Cart is Empty
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              Looks like you haven&apos;t added any programs to your cart yet.
              Browse our programs to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/adult-programs/get-golf-ready-level-1">
                <Button className="bg-orange-500 enabled:hover:bg-orange-600 text-white py-3 px-8 text-lg cursor-pointer transition-transform enabled:hover:scale-105">
                  Browse Adult Programs
                </Button>
              </Link>
              <Link href="/junior-programs/beginner-series">
                <Button
                  variant="outline"
                  className="py-3 px-8 text-lg cursor-pointer transition-transform enabled:hover:scale-105 border-green-600 text-green-700 enabled:hover:bg-green-50 enabled:hover:text-green-800"
                >
                  Browse Junior Programs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-gray-100 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <div className="w-[92%] max-w-6xl mx-auto py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-10">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
                Shopping Cart
              </h1>
              <Button
                variant="ghost"
                className="text-gray-500 enabled:hover:text-red-600 enabled:hover:bg-red-50 text-base cursor-pointer"
                onClick={() => clearCart()}
                type="button"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Clear Cart
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart items: one card, separators between programs */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden bg-white shadow-md">
                  {items.map((item, index) => {
                    const scheduleInfo = item.session
                      ? formatSessionSchedule(item.session.schedule)
                      : null;

                    const privateInfo = PRIVATE_INSTRUCTION_IDS.includes(
                      item.programId,
                    )
                      ? formatPrivateInstructionMetadata(item.metadata)
                      : null;

                    const showMiddle = privateInfo
                      ? privateInfo.isOnCourse || (privateInfo.coachesCount ?? 0) > 0
                      : false;

                    const isPrivate = PRIVATE_INSTRUCTION_IDS.includes(
                      item.programId,
                    );

                    const programImage =
                      item.program?.imageUrl ||
                      PROGRAM_IMAGE_MAP[item.programId];

                    // Calculate availability
                    let maxQuantity = Infinity;
                    let isSoldOut = false;
                    let hasInsufficientQuantity = false;

                    if (item.session) {
                      const enrolled = item.session.enrolledCount ?? 0;
                      maxQuantity = Math.max(
                        0,
                        item.session.capacity - enrolled,
                      );
                      isSoldOut = maxQuantity === 0;
                      hasInsufficientQuantity = item.quantity > maxQuantity;
                    }

                    // Check for new availability property
                    if (item.availability && !item.availability.isAvailable) {
                      isSoldOut = true;
                    }

                    const hasError =
                      validationErrors[item.id] ||
                      hasInsufficientQuantity ||
                      isSoldOut;

                    return (
                      <React.Fragment key={item.id}>
                        {index > 0 ? (
                          <Separator className="bg-border/80" />
                        ) : null}
                        <div
                          className={`p-6 md:p-8 transition-colors ${
                            hasError
                              ? "bg-red-50/50 ring-2 ring-red-500 ring-inset"
                              : ""
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            {/* Program Image */}
                            <div className="relative flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white sm:h-32 sm:w-32 sm:bg-gray-100">
                              {programImage ? (
                                <Image
                                  src={programImage}
                                  alt={item.program?.name || "Program"}
                                  fill
                                  className="object-contain sm:object-cover"
                                  sizes="(max-width: 639px) 100vw, 128px"
                                  priority
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                                  <span className="text-white text-3xl font-bold">
                                    {item.program?.type === "junior"
                                      ? "J"
                                      : "A"}
                                  </span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="absolute right-2 top-2 z-10 rounded-md bg-white/90 p-1.5 text-gray-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-red-600 sm:hidden"
                                aria-label="Remove item"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>

                            {/* Program Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-bold text-gray-800 text-lg md:text-xl">
                                    {item.program?.name || "Program"}
                                  </h3>
                                  <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
                                    {item.registrationType === "junior"
                                      ? "Junior Program"
                                      : "Adult Program"}
                                  </p>
                                  {item.session && (
                                    <div className="mt-3 space-y-2">
                                      <div className="flex flex-col gap-1 text-sm text-gray-700">
                                        <div className="flex items-start gap-2">
                                          <Calendar
                                            size={16}
                                            className="text-green-600 shrink-0 mt-0.5"
                                          />
                                          <span className="font-semibold leading-tight">
                                            {item.session.name}
                                          </span>
                                        </div>
                                        {scheduleInfo && (
                                          <div className="pl-6 text-xs font-medium text-gray-500">
                                            {scheduleInfo.sessionCount} Session{Number(scheduleInfo.sessionCount) === 1 ? "" : "s"}
                                          </div>
                                        )}
                                      </div>
                                      {scheduleInfo && (
                                        <div className="mt-4 space-y-3">
                                          <div className="pl-1 space-y-3">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                              Schedule:
                                            </p>
                                            {scheduleInfo.sessionGroups.map(
                                              (group: any, idx: number) => (
                                                <div
                                                  key={idx}
                                                  className="border-l-2 border-green-200 py-1 pl-3"
                                                >
                                                  <p className="text-sm font-bold text-gray-800">
                                                    {group.dayLabel} at {group.timeRange}
                                                  </p>
                                                  <p className="text-xs text-gray-500 mt-0.5">
                                                    {group.dateRange}
                                                    {group.count > 1 && (
                                                      <span className="text-gray-400 ml-1">
                                                        ({group.count} sessions)
                                                      </span>
                                                    )}
                                                  </p>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Private instruction (adult + junior program IDs): shared schedule UI */}
                                   {privateInfo && (
                                     <div className="mt-4 space-y-3">
                                       <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-800 font-semibold bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 w-fit">
                                         <Users
                                           size={16}
                                           className="text-orange-600 shrink-0"
                                         />
                                         <span>
                                           {item.quantity} Player
                                           {item.quantity !== 1 ? "s" : ""}
                                         </span>
                                         
                                         <span className="text-gray-400 mx-1">•</span>
                                         
                                         {showMiddle && (
                                           <>
                                             {privateInfo.isOnCourse ? (
                                               <div className="flex flex-col">
                                                 <span>On-Course Coaching</span>
                                                 {(privateInfo.coachesCount ?? 0) > 0 ? (
                                                   <span className="text-xs text-gray-500 font-normal -mt-0.5">
                                                     {privateInfo.coachesCount === 1
                                                       ? "1 Coach"
                                                       : `${privateInfo.coachesCount} Coaches`}
                                                   </span>
                                                 ) : null}
                                               </div>
                                             ) : (
                                               <span>
                                                 {privateInfo.coachesCount === 1
                                                   ? "1 Coach"
                                                   : `${privateInfo.coachesCount} Coaches`}
                                               </span>
                                             )}
                                             <span className="text-gray-400 mx-1">•</span>
                                           </>
                                         )}
                                         
                                         <span className="text-green-700">
                                           {Number(privateInfo.totalHours ||
                                             privateInfo.sessionCount) === 1
                                             ? "1 hr total"
                                             : `${privateInfo.totalHours || privateInfo.sessionCount} hrs total`}
                                         </span>
                                       </div>

                                      <div className="pl-1 space-y-3">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                          Schedule:
                                        </p>
                                        {privateInfo.groups.map(
                                          (group: any, idx: number) => (
                                            <div
                                              key={idx}
                                              className="border-l-2 border-green-200 py-1 pl-3"
                                            >
                                              <p className="text-sm font-bold text-gray-800">
                                                {group.dayLabel} at {group.timeRange}
                                              </p>
                                              <p className="text-xs text-gray-500 mt-0.5">
                                                {group.dateRange}
                                                {group.count > 1 && (
                                                  <span className="text-gray-400 ml-1">
                                                    ({group.count} sessions)
                                                  </span>
                                                )}
                                              </p>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="hidden shrink-0 cursor-pointer p-1 text-gray-400 transition-colors enabled:hover:text-red-600 sm:flex"
                                  aria-label="Remove item"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>

                              <div className="flex flex-row items-center justify-between w-full mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100 gap-4">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-3">
                                  {(() => {
                                    // For private instructions, get the base player count from metadata
                                    let minQuantity = 1;
                                    if (isPrivate && item.metadata) {
                                      try {
                                        const meta = JSON.parse(item.metadata);
                                        if (
                                          meta.playersCount &&
                                          meta.playersCount > 0
                                        ) {
                                          minQuantity = meta.playersCount;
                                        }
                                      } catch {}
                                    }
                                    const isAtMinimum =
                                      item.quantity <= minQuantity;

                                    return isAtMinimum ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span
                                            tabIndex={0}
                                            className="inline-flex cursor-not-allowed"
                                          >
                                            <button
                                              disabled
                                              className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors shrink-0 border-gray-200 text-gray-300 pointer-events-none"
                                              aria-label="Decrease quantity"
                                            >
                                              <Minus size={16} />
                                            </button>
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                          <p>
                                            {isPrivate
                                              ? `Minimum ${minQuantity} player${minQuantity !== 1 ? "s" : ""} for this package`
                                              : "Minimum quantity is 1"}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.id,
                                            item.quantity - 1,
                                          )
                                        }
                                        className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors shrink-0 border-gray-300 enabled:hover:bg-gray-100 cursor-pointer"
                                        aria-label="Decrease quantity"
                                      >
                                        <Minus size={16} />
                                      </button>
                                    );
                                  })()}
                                  <div className="flex flex-col items-center justify-center min-w-[3.5rem]">
                                    <div className="flex items-center justify-center">
                                      <span className="font-bold text-lg">
                                        {item.quantity}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500 -mt-1 selection:bg-transparent">
                                      Player{item.quantity !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  {(() => {
                                    let isDisabled = false;
                                    if (item.session) {
                                      const enrolled =
                                        item.session.enrolledCount ?? 0;
                                      const maxAvailable =
                                        item.session.capacity - enrolled;
                                      isDisabled =
                                        item.quantity >= maxAvailable;
                                    }

                                    if (isDisabled) {
                                      return (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span
                                              tabIndex={0}
                                              className="inline-flex cursor-not-allowed"
                                            >
                                              <button
                                                disabled
                                                className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors shrink-0 border-gray-200 text-gray-300 pointer-events-none"
                                                aria-label="Increase quantity"
                                              >
                                                <Plus size={16} />
                                              </button>
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent side="bottom">
                                            <p>Session capacity reached</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      );
                                    }

                                    return (
                                      <button
                                        onClick={() => {
                                          if (item.session) {
                                            const enrolled =
                                              item.session.enrolledCount ?? 0;
                                            const maxAvailable =
                                              item.session.capacity - enrolled;
                                            if (
                                              item.quantity + 1 >
                                              maxAvailable
                                            )
                                              return;
                                          }
                                          updateQuantity(
                                            item.id,
                                            item.quantity + 1,
                                          );
                                        }}
                                        className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors shrink-0 border-gray-300 enabled:hover:bg-gray-100 cursor-pointer"
                                        aria-label="Increase quantity"
                                      >
                                        <Plus size={16} />
                                      </button>
                                    );
                                  })()}
                                </div>

                                {/* Price */}
                                <div className="flex flex-col items-end shrink-0 justify-center">
                                  <p className="text-xl md:text-2xl font-bold text-green-700 leading-tight">
                                    ${formatPrice(
                                      Math.round(
                                        parseFloat(item.priceAtAdd) *
                                          item.quantity *
                                          100,
                                      ) / 100
                                    )}
                                  </p>
                                  <p className={`text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 ${item.quantity > 1 ? 'visible' : 'invisible'}`}>
                                    ${item.priceAtAdd} each
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          {(validationErrors[item.id] ||
                            hasInsufficientQuantity ||
                            isSoldOut) && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">
                                  {isSoldOut
                                    ? "Item Unavailable"
                                    : "Item Unavailable"}
                                </p>
                                <p className="text-sm mt-1">
                                  {item.availability?.error ||
                                    validationErrors[item.id] ||
                                    (isSoldOut
                                      ? "This item is sold out or unavailable."
                                      : `Only ${maxQuantity} spot${maxQuantity === 1 ? "" : "s"} available.`)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </Card>


              </div>

              {/* Order summary — desktop sidebar */}
              <div className="hidden lg:block lg:col-span-1">
                <Card className="p-8 bg-white sticky top-8 shadow-md">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-8">
                    <DiscountSection />
                    
                    {discountAmount > 0 ? (
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span>${formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span className="font-medium">-${formatPrice(discountAmount)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex justify-between text-2xl font-bold text-gray-800">
                            <span>Total</span>
                            <span className="text-green-700">
                              ${formatPrice(finalTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between text-2xl font-bold text-gray-800 border-t border-gray-200 pt-4">
                        <span>Total</span>
                        <span className="text-green-700">
                          ${formatPrice(total)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleProceedToCheckout}
                    disabled={isValidating}
                    className="w-full bg-orange-500 enabled:hover:bg-orange-600 text-white py-4 text-lg font-semibold cursor-pointer shadow-lg enabled:hover:shadow-xl transition-all enabled:hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Checking Availability...
                      </>
                    ) : (
                      <>
                        Proceed to Checkout
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-gray-500 text-center mt-6">
                    You&apos;ll complete registration forms for each program at
                    checkout
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Order summary — mobile: fixed to bottom for quick checkout */}
        <div
          className="fixed inset-x-0 bottom-0 z-40 m-0 border-t border-gray-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:hidden"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50/80">
            <DiscountSection />
          </div>
          <div className="mx-auto w-[92%] max-w-6xl px-1 pt-3 pb-3">
            <div className="flex items-start gap-3">
              <div className="min-w-0 shrink pt-1">
                <p className="text-xs font-medium text-gray-500">Total</p>
                <p className="text-xl font-bold text-green-700 tabular-nums leading-none mt-1">
                  ${formatPrice(finalTotal)}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <Button
                  onClick={handleProceedToCheckout}
                  disabled={isValidating}
                  className="w-full min-h-12 bg-orange-500 enabled:hover:bg-orange-600 text-white py-3 text-base font-semibold cursor-pointer shadow-md enabled:hover:shadow-lg transition-all disabled:bg-stone-200 disabled:text-stone-500 disabled:opacity-100 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  Checkout
                  <ArrowRight className={`ml-2 w-5 h-5 shrink-0 transition-opacity ${isValidating ? 'opacity-0' : 'opacity-100'}`} />
                </Button>
                <div
                  className={`overflow-hidden text-[11px] font-medium text-stone-500 transition-all duration-200 ${
                    isValidating
                      ? "mt-1.5 flex h-4 items-center justify-center gap-1.5 opacity-100"
                      : "mt-0 h-0 opacity-0 pointer-events-none"
                  }`}
                  aria-hidden={!isValidating}
                >
                  <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
                  <span>Checking availability...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
