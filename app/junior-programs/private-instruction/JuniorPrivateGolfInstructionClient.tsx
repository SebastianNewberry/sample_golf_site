"use client";

import { useState, useMemo } from "react";
import { useWarmProgramCatalog } from "@/app/components/ProgramCatalogContext";
import {
  CheckCircle2,
  Phone,
  CalendarClock,
  Clock,
  Users,
} from "lucide-react";
import Image from "next/image";
import {
  programCardImageClass,
  programCardImageContainer,
  programCardImageFrameJuniorPrivate,
  programPageContent,
} from "@/app/components/program-page-layout";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/cart/CartContext";
import { addToCart } from "@/app/actions/cart";
import { Loader2, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  CartButtonLabel,
  type CartButtonStatus,
} from "@/app/components/CartButtonLabel";
import defaultImage from "@/public/junior_private_instruction.webp";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { SessionCalendar } from "@/app/components/SessionCalendar";
import { PrivateInstructionCalendar } from "@/app/components/PrivateInstructionCalendar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, isSameDay } from "date-fns";
import { ProgramPageTitle } from "@/app/components/ProgramPageTitle";
import { ProgramSidebarHeader } from "@/app/components/ProgramSidebarHeader";
import { ProgramSidebarNav } from "@/app/components/ProgramSidebarNav";
import { useProgramSidebarNav } from "@/lib/use-program-sidebar-nav";
import { SessionSchedulePanel } from "@/app/components/SessionSchedulePanel";
import { DisabledActionTooltip } from "@/app/components/DisabledActionTooltip";
import { useProgramVisibility } from "@/app/components/ProgramVisibilityContext";
import { getPurchaseBlockReason } from "@/lib/purchase-availability";

interface JuniorPrivateGolfInstructionClientProps {
  program: any;
  initialAvailableSlots: any[];
  slotsLoading?: boolean;
}

export function JuniorPrivateGolfInstructionClient({
  program,
  initialAvailableSlots,
  slotsLoading = false,
}: JuniorPrivateGolfInstructionClientProps) {
  useWarmProgramCatalog();
  const router = useRouter();
  const { addItem, isAddingToCart, refreshCart } = useCart();

  // Local state for animations and loading
  const [showSuccess, setShowSuccess] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  // State
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [selectedSessionCount, setSelectedSessionCount] = useState<number>(1);
  const [selectedDurationMinutes, setSelectedDurationMinutes] =
    useState<number>(60);
  const [selectedPlayersCount, setSelectedPlayersCount] = useState<number>(1);
  const [selectedIsOnCourse, setSelectedIsOnCourse] = useState<boolean>(false);
  const [selectedCoachesCount, setSelectedCoachesCount] = useState<number>(0);
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]); // Array of slots
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { showNav, toggleNav } = useProgramSidebarNav();
  const { isIdActive } = useProgramVisibility();
  const isProgramActive = isIdActive(program.id);

  const { items } = useCart();

  // Helper to parse local date string YYYY-MM-DD
  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  // Parse all available sessions into flat slots for the calendar, filtering out what's in cart
  // Calculate slots currently in the cart
  const cartSlots = useMemo(() => {
    return items
      .filter(
        (item) =>
          item.programId === program.id && item.registrationType === "junior",
      )
      .flatMap((item) => {
        try {
          if (item.metadata) {
            const data = JSON.parse(item.metadata);
            return (data.slots || []).map((s: any) => ({
              ...s,
              date:
                typeof s.date === "string" && s.date.includes("-")
                  ? parseLocalDate(s.date.split("T")[0])
                  : new Date(s.date),
            }));
          }
        } catch (e) {
          console.error("Failed to parse cart item metadata", e);
        }
        return [];
      });
  }, [items, program.id]);

  // Helper to get current EST time
  const getNowEST = () => {
    const d = new Date();
    const estString = d.toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    return new Date(estString);
  };

  // Use the pre-calculated available slots passed from server
  const availableSlots = useMemo(() => {
    const nowEST = getNowEST();

    return initialAvailableSlots
      .map((slot) => ({
        ...slot,
        date:
          typeof slot.date === "string"
            ? parseLocalDate(slot.date)
            : new Date(slot.date), // Ensure date object is local
      }))
      .filter((slot) => {
        // Filter out past slots
        const slotDate = new Date(slot.date);
        const [h, m] = slot.startTime.split(":").map(Number);
        slotDate.setHours(h, m, 0, 0);
        return slotDate > nowEST;
      });
  }, [initialAvailableSlots]);

  const noOpenTimes = !slotsLoading && availableSlots.length === 0;

  // Parse DB Pricing Options
  const pricingOptions = useMemo(() => {
    if (!program?.pricingOptions) return [];
    try {
      if (typeof program.pricingOptions === "string") {
        return JSON.parse(program.pricingOptions);
      }
      return program.pricingOptions;
    } catch (e) {
      console.error("Error parsing program pricing options", e);
      return [];
    }
  }, [program?.pricingOptions]);

  // Determine Max Slots based on selected package
  const maxSlots = selectedSessionCount || 1;

  // Invalidate selected slot if duration changes
  const handlePriceSelect = (pkg: any) => {
    setSelectedDuration(pkg.title);
    setSelectedPrice(Number(pkg.price));
    setSelectedPackageId(pkg.id);
    setSelectedSessionCount(Number(pkg.sessionCount) || 1);
    setSelectedDurationMinutes(Number(pkg.durationMinutes) || 60);
    setSelectedPlayersCount(Number(pkg.playersCount) || 1);
    setSelectedIsOnCourse(Boolean(pkg.isOnCourse));
    setSelectedCoachesCount(Number(pkg.coachesCount) || 0);
    setSelectedSlots([]); // Reset date selection
  };

  const handleSlotSelect = (slot: any) => {
    // Check if slot is already selected
    const isAlreadySelected = selectedSlots.some(
      (s) =>
        s.date.getTime() === slot.date.getTime() &&
        s.startTime === slot.startTime,
    );

    if (isAlreadySelected) {
      // Remove it
      handleRemoveSlot(slot);
    } else {
      // Add it if space
      if (maxSlots === 1) {
        setSelectedSlots([slot]);
      } else {
        if (selectedSlots.length < maxSlots) {
          setSelectedSlots([...selectedSlots, slot]);
        }
      }
    }
  };

  const handleRemoveSlot = (slotToRemove: any) => {
    setSelectedSlots(
      selectedSlots.filter(
        (s) =>
          s !== slotToRemove &&
          // Compare unique properties to be safe
          !(
            s.date.getTime() === slotToRemove.date.getTime() &&
            s.startTime === slotToRemove.startTime
          ),
      ),
    );
  };

  // Cart Actions
  const handleAddToCart = async () => {
    if (isAddingToCart || selectedSlots.length === 0 || !selectedDuration) return;

    // Double check: ensure none of the selected slots are already in cart
    const isConflict = selectedSlots.some((slot) =>
      items.some((item) => {
        if (item.programId !== program.id) return false;
        try {
          const meta = item.metadata ? JSON.parse(item.metadata) : {};
          return (meta.slots || []).some(
            (s: any) =>
              new Date(s.date).getTime() === slot.date.getTime() &&
              s.startTime === slot.startTime,
          );
        } catch {
          return false;
        }
      }),
    );

    if (isConflict) {
      alert("One or more selected slots are already in your cart.");
      return;
    }

    // Calculate total hours
    const totalHours = (selectedDurationMinutes * selectedSlots.length) / 60;

    // Serialize slot details into metadata
    const metadata = JSON.stringify({
      packageId: selectedPackageId,
      duration: selectedDuration,
      totalHours,
      isOnCourse: selectedIsOnCourse,
      coachesCount: selectedCoachesCount,
      slots: selectedSlots.map((s) => ({
        date: format(s.date, "yyyy-MM-dd"),
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      // Legacy fields
      date: selectedSlots[0].date,
      startTime: selectedSlots[0].startTime,
      endTime: selectedSlots[0].endTime,
      count: selectedSlots.length,
      playersCount: selectedPlayersCount,
    });

    const result = await addItem({
      programId: program.id,
      registrationType: "junior",
      price: selectedPrice,
      metadata,
      quantity: selectedPlayersCount,
    });

    if (result.success) {
      setShowSuccess(true);
      setSelectedSlots([]); // Clear selection
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (isAddingToCart || selectedSlots.length === 0 || !selectedDuration) return;

    // Double check conflict
    const isConflict = selectedSlots.some((slot) =>
      items.some((item) => {
        if (item.programId !== program.id) return false;
        try {
          const meta = item.metadata ? JSON.parse(item.metadata) : {};
          return (meta.slots || []).some(
            (s: any) =>
              new Date(s.date).getTime() === slot.date.getTime() &&
              s.startTime === slot.startTime,
          );
        } catch {
          return false;
        }
      }),
    );

    if (isConflict) {
      alert("One or more selected slots are already in your cart.");
      return;
    }

    setIsBuyNowLoading(true);

    // Calculate total hours
    const totalHours = (selectedDurationMinutes * selectedSlots.length) / 60;

    // Serialize slot details into metadata
    const metadata = JSON.stringify({
      packageId: selectedPackageId,
      duration: selectedDuration,
      totalHours,
      slots: selectedSlots.map((s) => ({
        date: format(s.date, "yyyy-MM-dd"),
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      // Legacy fields
      date: selectedSlots[0].date,
      startTime: selectedSlots[0].startTime,
      endTime: selectedSlots[0].endTime,
      count: selectedSlots.length,
      playersCount: selectedPlayersCount,
    });

    const result = await addToCart({
      programId: program.id,
      registrationType: "junior",
      price: selectedPrice,
      metadata,
      quantity: selectedPlayersCount,
    });

    if (result.success) {
      await refreshCart();
      router.push("/checkout");
    } else {
      setIsBuyNowLoading(false);
      // Optional: handle error
    }
  };

  const purchaseBlockReason = getPurchaseBlockReason({
    isProgramActive,
    noSessions: noOpenTimes,
    needsSelection: selectedSlots.length < maxSlots || !selectedDuration,
    selectionLabel: "Please select a package above first",
  });
  const addToCartStatus: CartButtonStatus = isAddingToCart
    ? "adding"
    : showSuccess
      ? "success"
      : "idle";
  // Selected slots are cleared after a successful add; keep the success state visible until it times out.
  const cartBlockReason = addToCartStatus === "idle" ? purchaseBlockReason : null;

  return (
    <>
      <PrivateInstructionCalendar
        open={isCalendarOpen}
        onOpenChange={setIsCalendarOpen}
        availableSlots={availableSlots}
        onSelectSlot={handleSlotSelect}
        onRemoveSlot={handleRemoveSlot}
        selectedSlots={selectedSlots}
        maxSlots={maxSlots}
        inCartSlots={cartSlots}
        programName="Junior Private Instruction"
        durationMinutes={selectedDurationMinutes}
      />

      {/* Main Content Grid - Centered */}
      <div className={programPageContent}>
        <div className="grid lg:grid-cols-13 gap-6">
          {/* Left Sidebar - Program Links + Calendar */}
          <div className="lg:col-span-3 space-y-2">
            {/* Header with program name */}
            <ProgramSidebarHeader
              title="Junior Private Golf Instruction"
              showNav={showNav}
              onToggle={toggleNav}
            />

            <ProgramSidebarNav variant="junior" mode="desktop" />

            {/* Mobile animated nav */}
            <AnimatePresence initial={false}>
              {showNav && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="lg:hidden overflow-hidden mb-2"
                >
                  <ProgramSidebarNav variant="junior" mode="mobile" />
                </motion.div>
              )}
            </AnimatePresence>

            <SessionSchedulePanel
                footnote={
                  <p className="text-xs text-gray-500 mt-2 px-1">
                    * Dates above are available dates, but you only sign up for
                    individual sessions.
                  </p>
                }
              >
                <SessionCalendar
                  embedded
                  hideSessionCount
                  schedule={availableSlots.map((s) => ({
                    date: s.date.toLocaleDateString("en-CA", {
                      timeZone: "America/New_York",
                    }),
                    startTime: s.startTime,
                    endTime: s.endTime,
                  }))}
                />
              </SessionSchedulePanel>
          </div>

          {/* Main Card: Image + Description + Price */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Two-column layout: Image + Description | Pricing */}
              <div className="flex flex-col">
                {/* Image */}
                <div className={programCardImageContainer}>
                  <div className={programCardImageFrameJuniorPrivate}>
                    <Image
                      src={defaultImage}
                      alt="Junior Private Golf Instruction"
                      width={800}
                      height={500}
                      className={`${programCardImageClass} object-bottom`}
                      priority
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8">
                  <ProgramPageTitle
                    variant="junior"
                    fallback="Junior Private Golf Instruction"
                    className="text-lg font-bold text-gray-900 mb-2"
                  />

                  <div className="space-y-4 mb-8">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Our junior private golf lesson offers individual
                      instruction with
                      <strong> Paul Toski, PGA Professional</strong>. We start
                      with an interview about current state of your childs game
                      and goals they aspire to achieve in golf. High-speed video
                      will be taken of their swing and after a review of video,
                      they will be introduced to specific drills and training
                      aids designed to improve their golf skills.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      At the end of each lesson we will review of key points,
                      prioritize skills that still need development, and
                      together lay out a plan for practice and on course play.
                    </p>
                  </div>

                  {/* Private Instruction Packages */}
                  <div className="mb-10">
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                        1
                      </span>
                      Select Private Instruction Package
                    </h3>

                    {pricingOptions.filter((p: any) => !p.isOnCourse).length >
                      0 && (
                      <div className="mb-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {pricingOptions
                            .filter((p: any) => !p.isOnCourse)
                            .map((pkg: any) => {
                              const isUnavailable =
                                !isProgramActive || noOpenTimes;
                              const content = (
                                <div
                                  key={pkg.id}
                                  onClick={() => {
                                    if (!isUnavailable) handlePriceSelect(pkg);
                                  }}
                                  className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1 min-h-[8rem]
                                    ${isUnavailable ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200" : "cursor-pointer"}
                                    ${
                                      !isUnavailable &&
                                      selectedPackageId === pkg.id
                                        ? "bg-[hsl(var(--golf-orange))]/5 border-[hsl(var(--golf-orange))] shadow-sm"
                                        : !isUnavailable
                                          ? "bg-white border-gray-100 hover:border-green-200 hover:bg-green-50 shadow-sm"
                                          : ""
                                    }`}
                                >
                                  <p className="text-gray-600 font-medium">
                                    {pkg.title}
                                  </p>
                                  <p
                                    className={`text-2xl font-bold my-1 ${selectedPackageId === pkg.id ? "text-[hsl(var(--golf-orange))]" : "text-[hsl(var(--golf-green))]"}`}
                                  >
                                    ${pkg.price}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {pkg.sessionCount === 1
                                      ? "Single Session"
                                      : `${pkg.sessionCount} Sessions`}
                                  </p>
                                </div>
                              );

                              if (isUnavailable) {
                                return (
                                  <TooltipProvider
                                    key={pkg.id}
                                    delayDuration={0}
                                  >
                                    <Tooltip disableHoverableContent>
                                      <TooltipTrigger asChild>
                                        {content}
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p>
                                          {!isProgramActive
                                            ? "Program no longer available"
                                            : "No sessions currently available"}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              }

                              return content;
                            })}
                        </div>
                      </div>
                    )}

                    {pricingOptions.filter((p: any) => p.isOnCourse).length >
                      0 && (
                      <div className="bg-gray-50/80 rounded-2xl p-6 lg:p-8 border border-gray-100 mt-8 mb-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">
                          On-Course Coaching (9 Hole Lesson)
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                          Our <strong>on-course coaching session</strong>{" "}
                          teaches your child how to take their game from the
                          practice area to the golf course. They will learn
                          under real playing conditions and receive invaluable
                          instruction on all aspects of their game. Includes
                          30-minute evaluation, improvement plan, green fees,
                          cart, and practice balls.{" "}
                          <strong>Approx. 3 Hours.</strong>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pricingOptions
                            .filter((p: any) => p.isOnCourse)
                            .map((pkg: any) => {
                              const isUnavailable =
                                !isProgramActive || noOpenTimes;
                              const content = (
                                <div
                                  key={pkg.id}
                                  onClick={() => {
                                    if (!isUnavailable) handlePriceSelect(pkg);
                                  }}
                                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between
                                    ${isUnavailable ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200" : "cursor-pointer"}
                                    ${
                                      !isUnavailable &&
                                      selectedPackageId === pkg.id
                                        ? "bg-[hsl(var(--golf-orange))]/5 border-[hsl(var(--golf-orange))] shadow-sm"
                                        : !isUnavailable
                                          ? "bg-white border-gray-100 hover:border-green-200 hover:bg-green-50 shadow-sm"
                                          : ""
                                    }`}
                                >
                                  <div>
                                    <p className="text-gray-900 font-bold text-lg">
                                      {pkg.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {pkg.playersCount === 1
                                        ? "1 Player"
                                        : `${pkg.playersCount} Players`}
                                    </p>
                                    {(pkg.coachesCount ?? 0) > 0 ? (
                                      <p className="text-xs text-[hsl(var(--golf-green))] font-semibold mt-1">
                                        {pkg.coachesCount === 1
                                          ? "1 Coach"
                                          : `${pkg.coachesCount} Coaches`}
                                      </p>
                                    ) : null}
                                  </div>
                                  <p
                                    className={`text-2xl font-bold ${selectedPackageId === pkg.id ? "text-[hsl(var(--golf-orange))]" : "text-[hsl(var(--golf-green))]"}`}
                                  >
                                    ${pkg.price}
                                  </p>
                                </div>
                              );

                              if (isUnavailable) {
                                return (
                                  <TooltipProvider
                                    key={pkg.id}
                                    delayDuration={0}
                                  >
                                    <Tooltip disableHoverableContent>
                                      <TooltipTrigger asChild>
                                        {content}
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p>
                                          {!isProgramActive
                                            ? "Program no longer available"
                                            : "No sessions currently available"}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              }

                              return content;
                            })}
                        </div>
                      </div>
                    )}

                    {pricingOptions.length === 0 && (
                      <p className="text-sm text-gray-500 italic col-span-full">
                        No pricing options are currently available for this
                        program.
                      </p>
                    )}
                  </div>

                  {/* Scheduling & Checkout Actions */}
                  <div className="bg-white border-t pt-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Step 2: Schedule */}
                      <div className="flex-1 w-full">
                        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                            2
                          </span>
                          Select Dates & Times
                        </h3>

                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 h-full flex flex-col justify-center">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {selectedSlots.length > 0
                                  ? `${selectedSlots.length} of ${maxSlots} slots selected`
                                  : "Schedule your session(s)"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {selectedDuration
                                  ? "Ready to schedule"
                                  : "Select a package above first"}
                              </p>
                            </div>
                            {selectedSlots.length >= maxSlots && (
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            )}
                          </div>

                          {!selectedDuration || !isProgramActive ? (
                            <DisabledActionTooltip
                              reason={
                                getPurchaseBlockReason({
                                  isProgramActive,
                                  noSessions: noOpenTimes,
                                  needsSelection: !selectedDuration,
                                  selectionLabel:
                                    "Please select a package above first",
                                }) ?? "Please select a package above first"
                              }
                            >
                              <Button
                                className="w-full h-14 bg-white border-2 border-gray-200 text-gray-400 pointer-events-none text-sm font-bold flex items-center justify-center gap-3 rounded-xl shadow-sm"
                                disabled
                              >
                                <CalendarClock className="w-6 h-6" />
                                Open Calendar
                              </Button>
                            </DisabledActionTooltip>
                          ) : (
                            <Button
                              onClick={() => setIsCalendarOpen(true)}
                              className="w-full h-14 bg-white border-2 border-green-600 text-green-700 enabled:hover:bg-green-50 text-sm font-bold flex items-center justify-center gap-3 rounded-xl shadow-sm"
                            >
                              <CalendarClock className="w-6 h-6" />
                              {selectedSlots.length > 0
                                ? "Edit Dates"
                                : "Open Calendar"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Step 3: Buy */}
                      <div className="flex-1 w-full">
                        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                            3
                          </span>
                          Checkout
                        </h3>

                        <div className="space-y-3">
                          <DisabledActionTooltip reason={cartBlockReason}>
                            <button
                              disabled={Boolean(purchaseBlockReason) || isBuyNowLoading}
                              onClick={handleBuyNow}
                              className={`w-full py-3 font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 ${
                                purchaseBlockReason || isBuyNowLoading
                                  ? "bg-gray-200 text-gray-400"
                                  : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg text-white cursor-pointer"
                              } ${cartBlockReason ? "pointer-events-none" : ""}`}
                            >
                              {isBuyNowLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <CreditCard className="w-5 h-5" />
                              )}
                              {isBuyNowLoading
                                ? "PROCESSING..."
                                : `BUY NOW ${!purchaseBlockReason && selectedPrice > 0 ? `- $${selectedPrice}` : ""}`}
                            </button>
                          </DisabledActionTooltip>

                          <DisabledActionTooltip reason={cartBlockReason}>
                            <button
                              disabled={Boolean(cartBlockReason) || isBuyNowLoading}
                              onClick={handleAddToCart}
                              aria-busy={isAddingToCart}
                              className={`w-full py-3 font-bold text-sm border-2 rounded-xl transition-colors flex items-center justify-center ${
                                cartBlockReason || isBuyNowLoading
                                  ? "bg-gray-50 border-gray-100 text-gray-300"
                                  : addToCartStatus === "idle"
                                    ? "bg-green-50 text-green-700 border-green-600 hover:bg-green-200 hover:border-green-700 cursor-pointer"
                                    : "bg-green-50 text-green-700 border-green-600"
                              } ${cartBlockReason ? "pointer-events-none" : ""}`}
                            >
                              <CartButtonLabel
                                status={addToCartStatus}
                                idleLabel="ADD TO CART"
                                addingLabel="ADDING..."
                                successLabel="ADDED!"
                                iconClassName="w-5 h-5"
                              />
                            </button>
                          </DisabledActionTooltip>
                        </div>
                      </div>
                    </div>

                    {/* Call Option */}
                    <div className="mt-8 pt-6 border-t flex flex-col items-center justify-center text-center">
                      <span className="text-sm text-gray-500 mb-3 bg-white px-3 -mt-9">
                        OR
                      </span>
                      <a
                        href="tel:+12485633561"
                        className="flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors font-medium cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        Call to Schedule: (248) 563-3561
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Features & Details */}
          <div className="lg:col-span-4 space-y-6">
            <ProgramFeaturesAndDetails
              features={program.features || []}
              details={program.details || []}
            />
          </div>
        </div>
      </div>
    </>
  );
}
