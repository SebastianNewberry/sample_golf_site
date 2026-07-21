"use client";
import { motion, AnimatePresence } from "motion/react";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Phone,
  CalendarClock,
  Clock,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/cart/CartContext";
import { addToCart } from "@/app/actions/cart";
import { Loader2, Check, ShoppingCart, CreditCard } from "lucide-react";
import {
  programCardImageClass,
  programCardImageContainer,
  programCardImageFrame,
  programPageClientGrid,
} from "@/app/components/program-page-layout";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { SessionCalendar } from "@/app/components/SessionCalendar";
import {
  SeriesCalendar,
  type SeriesSlot,
  type SlotCapacity,
} from "@/app/components/SeriesCalendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ProgramSession } from "@/db/schema";
import { ContentFadeIn } from "@/app/components/ContentFadeIn";
import { ProgramSidebarHeader } from "@/app/components/ProgramSidebarHeader";
import { ProgramSidebarNav } from "@/app/components/ProgramSidebarNav";
import { useProgramSidebarNav } from "@/lib/use-program-sidebar-nav";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DevelopmentalSeriesClientProps {
  program: {
    id: string;
    name: string;
    description: string;
    price: string;
    duration: string;
    schedulingType: string;
    seriesCapacityPerSlot: number | null;
    features: string[] | null;
    details: string | any[] | null;
    pricingOptions: any[];
    imageUrl: string | null;
  };
  sessions: ProgramSession[];
  slotEnrollmentData: Record<
    string,
    {
      slotDate: string;
      slotStartTime: string;
      slotEndTime: string;
      enrolledCount: number;
    }[]
  >;
}

export function DevelopmentalSeriesClient({
  program,
  sessions,
  slotEnrollmentData,
}: DevelopmentalSeriesClientProps) {
  const router = useRouter();
  const { addItem, isAddingToCart, refreshCart } = useCart();

  // Local state
  const [showSuccess, setShowSuccess] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  // Package selection state
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [selectedSessionCount, setSelectedSessionCount] = useState<number>(1);
  const [selectedSlots, setSelectedSlots] = useState<SeriesSlot[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { showNav, toggleNav } = useProgramSidebarNav();

  // The first active session is the current series
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.isActive) || sessions[0];
  }, [sessions]);

  const { items } = useCart();

  // Parse pricing options (already parsed from server)
  const pricingOptions = program.pricingOptions || [];

  // Max slots based on selected package
  const maxSlots = selectedSessionCount || 1;

  // Helper to get current EST time
  const getNowEST = () => {
    const d = new Date();
    const estString = d.toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    return new Date(estString);
  };

  // Build available slots from the session schedule
  const availableSlots = useMemo<SeriesSlot[]>(() => {
    if (!activeSession?.schedule) return [];

    try {
      const schedule =
        typeof activeSession.schedule === "string"
          ? JSON.parse(activeSession.schedule)
          : activeSession.schedule;

      if (!Array.isArray(schedule)) return [];

      const nowEST = getNowEST();

      return schedule
        .map(
          (entry: { date: string; startTime: string; endTime: string }) => ({
            date: entry.date,
            startTime: entry.startTime,
            endTime: entry.endTime,
          }),
        )
        .filter((slot) => {
          // Filter out past slots
          const [y, m, d] = slot.date.split('-').map(Number);
          const slotDate = new Date(y, m - 1, d);
          const [h, min] = slot.startTime.split(":").map(Number);
          slotDate.setHours(h, min, 0, 0);
          return slotDate > nowEST;
        });
    } catch (e) {
      console.error("Failed to parse session schedule", e);
      return [];
    }
  }, [activeSession]);

  // Build slot capacity map
  const slotCapacities = useMemo<Record<string, SlotCapacity>>(() => {
    if (!activeSession) return {};

    const enrollments = slotEnrollmentData[activeSession.id] || [];
    const capacity = program.seriesCapacityPerSlot || 999;

    const result: Record<string, SlotCapacity> = {};

    // Initialize all available slots with 0 enrolled
    for (const slot of availableSlots) {
      const key = `${slot.date}|${slot.startTime}`;
      result[key] = { enrolled: 0, capacity };
    }

    // Overlay actual enrollment data
    for (const enrollment of enrollments) {
      const key = `${enrollment.slotDate}|${enrollment.slotStartTime}`;
      if (result[key]) {
        result[key].enrolled = enrollment.enrolledCount;
      } else {
        result[key] = { enrolled: enrollment.enrolledCount, capacity };
      }
    }

    return result;
  }, [
    activeSession,
    slotEnrollmentData,
    availableSlots,
    program.seriesCapacityPerSlot,
  ]);

  // Calculate slots currently in the cart for this program
  const cartSlots = useMemo<SeriesSlot[]>(() => {
    return items
      .filter(
        (item) =>
          item.programId === program.id && item.registrationType === "junior",
      )
      .flatMap((item) => {
        try {
          if (item.metadata) {
            const data = JSON.parse(item.metadata);
            return (data.slots || []).map((s: SeriesSlot) => s);
          }
        } catch (e) {
          console.error("Failed to parse cart item metadata", e);
        }
        return [];
      });
  }, [items, program.id]);

  const handlePriceSelect = (pkg: any) => {
    setSelectedPackageId(pkg.id);
    setSelectedPrice(Number(pkg.price));
    setSelectedSessionCount(Number(pkg.sessionCount) || 1);
    setSelectedSlots([]); // Reset selection
  };

  const handleSlotSelect = (slot: SeriesSlot) => {
    const isAlreadySelected = selectedSlots.some(
      (s) => s.date === slot.date && s.startTime === slot.startTime,
    );

    if (isAlreadySelected) {
      handleRemoveSlot(slot);
    } else {
      if (selectedSlots.length < maxSlots) {
        setSelectedSlots([...selectedSlots, slot]);
      }
    }
  };

  const handleRemoveSlot = (slotToRemove: SeriesSlot) => {
    setSelectedSlots(
      selectedSlots.filter(
        (s) =>
          !(
            s.date === slotToRemove.date &&
            s.startTime === slotToRemove.startTime
          ),
      ),
    );
  };

  // Cart Actions
  const handleAddToCart = async () => {
    if (selectedSlots.length === 0 || !selectedPackageId) return;

    const metadata = JSON.stringify({
      packageId: selectedPackageId,
      slots: selectedSlots.map((s) => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      date: selectedSlots[0].date,
      startTime: selectedSlots[0].startTime,
      endTime: selectedSlots[0].endTime,
      count: selectedSlots.length,
      playersCount: 1,
    });

    const result = await addItem({
      programId: program.id,
      programSessionId: activeSession?.id,
      registrationType: "junior",
      price: selectedPrice,
      metadata,
      quantity: 1,
    });

    if (result.success) {
      setShowSuccess(true);
      setSelectedSlots([]);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (selectedSlots.length === 0 || !selectedPackageId) return;

    setIsBuyNowLoading(true);

    const metadata = JSON.stringify({
      packageId: selectedPackageId,
      slots: selectedSlots.map((s) => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      date: selectedSlots[0].date,
      startTime: selectedSlots[0].startTime,
      endTime: selectedSlots[0].endTime,
      count: selectedSlots.length,
      playersCount: 1,
    });

    const result = await addToCart({
      programId: program.id,
      programSessionId: activeSession?.id,
      registrationType: "junior",
      price: selectedPrice,
      metadata,
      quantity: 1,
    });

    if (result.success) {
      await refreshCart();
      router.push("/checkout");
    } else {
      setIsBuyNowLoading(false);
    }
  };

  return (
    <div className={programPageClientGrid}>
      <SeriesCalendar
        open={isCalendarOpen}
        onOpenChange={setIsCalendarOpen}
        availableSlots={availableSlots}
        onSelectSlot={handleSlotSelect}
        onRemoveSlot={handleRemoveSlot}
        selectedSlots={selectedSlots}
        maxSlots={maxSlots}
        inCartSlots={cartSlots}
        programName="Junior Developmental Series"
        slotCapacities={slotCapacities}
      />

      {/* Left Sidebar */}
      <div className="lg:col-span-3 space-y-2">
        <ProgramSidebarHeader
          title="Junior Developmental Series"
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

        {/* Calendar preview of available dates */}
        <ContentFadeIn className="mt-6">
          <SessionCalendar
            schedule={availableSlots.map((s) => ({
              date: s.date,
              startTime: s.startTime,
              endTime: s.endTime,
            }))}
            hideSessionCount
          />
          <p className="text-xs text-gray-500 mt-2 px-1">
            * Dates above are available dates, but you only sign up for
            individual sessions.
          </p>
        </ContentFadeIn>
      </div>

      {/* Main Card */}
      <ContentFadeIn className="lg:col-span-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col">
            {/* Image */}
            <div className={programCardImageContainer}>
              <div className={programCardImageFrame}>
                <img
                  src="/junior_development_series.gif"
                  alt="Junior Developmental Series"
                  className={programCardImageClass}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8">
              <h1 className="text-lg font-bold text-gray-900 mb-2">
                Junior Developmental Series
              </h1>

              <div className="space-y-4 mb-8">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our <strong>Junior Developmental Series</strong> is designed
                  for intermediate to advanced junior golfers looking to expand
                  their golf skills and improve on-course play, and for those
                  players who aspire to play or are already playing competitive
                  golf.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The <strong>Junior Developmental Series</strong> builds on
                  principles learned in <strong>Junior Beginner Series</strong>.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Choose a package below and pick your preferred session dates
                  from the calendar. A personalized improvement plan will be
                  developed for each student based on his or her goals, ability
                  and commitment level.
                </p>
              </div>

              {/* Step 1: Select Package */}
              <div className="mb-10">
                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Select Series Package
                </h3>

                {pricingOptions.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {pricingOptions.map((pkg: any) => {
                      const isUnavailable = availableSlots.length === 0;
                      const content = (
                        <div
                          key={pkg.id}
                          onClick={() => {
                            if (!isUnavailable) handlePriceSelect(pkg);
                          }}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1 min-h-[8rem]
                            ${isUnavailable ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200" : "cursor-pointer"}
                            ${
                              !isUnavailable && selectedPackageId === pkg.id
                                ? "bg-[hsl(var(--golf-orange))]/5 border-[hsl(var(--golf-orange))] shadow-sm"
                                : !isUnavailable ? "bg-white border-gray-100 hover:border-green-200 hover:bg-green-50 shadow-sm" : ""
                            }`}
                        >
                          <p className="text-gray-600 font-medium">{pkg.title}</p>
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
                          <TooltipProvider key={pkg.id} delayDuration={0}>
                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                {content}
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="pointer-events-none">
                                <p>No sessions currently available</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }

                      return content;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No pricing options are currently available for this program.
                  </p>
                )}
              </div>

              {/* Step 2 & 3: Schedule & Checkout */}
              <div className="bg-white border-t pt-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Step 2: Schedule */}
                  <div className="flex-1 w-full">
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                        2
                      </span>
                      Select Session Dates
                    </h3>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {selectedSlots.length > 0
                              ? `${selectedSlots.length} of ${maxSlots} sessions selected`
                              : "Schedule your session(s)"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedPackageId
                              ? "Ready to schedule"
                              : "Select a package above first"}
                          </p>
                        </div>
                        {selectedSlots.length >= maxSlots && (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        )}
                      </div>

                      {!selectedPackageId ? (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div className="w-full cursor-not-allowed">
                                <Button
                                  className="w-full h-14 bg-white border-2 border-gray-200 text-gray-400 pointer-events-none text-sm font-bold flex items-center justify-center gap-3 rounded-xl shadow-sm"
                                  disabled
                                >
                                  <CalendarClock className="w-6 h-6" />
                                  Open Calendar
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="pointer-events-none">
                              <p>{availableSlots.length === 0 ? "No sessions currently available" : "Please select a package above first"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
                      {selectedSlots.length < maxSlots || !selectedPackageId ? (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div className="w-full cursor-not-allowed">
                                <button
                                  disabled
                                  className="w-full py-3 font-bold text-sm bg-gray-200 text-gray-400 pointer-events-none rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                  <CreditCard className="w-5 h-5" />
                                  BUY NOW
                                </button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="pointer-events-none">
                              <p>{availableSlots.length === 0 ? "No sessions currently available" : "Please select a package above first"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <button
                          disabled={isBuyNowLoading || isAddingToCart}
                          onClick={handleBuyNow}
                          className="w-full py-3 font-bold text-sm bg-orange-500 enabled:hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl shadow-md enabled:hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isBuyNowLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <CreditCard className="w-5 h-5" />
                          )}
                          {isBuyNowLoading
                            ? "PROCESSING..."
                            : `BUY NOW ${selectedPrice > 0 ? `- $${selectedPrice}` : ""}`}
                        </button>
                      )}


                      {selectedSlots.length < maxSlots || !selectedPackageId ? (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div className="w-full cursor-not-allowed">
                                <button
                                  disabled
                                  className="w-full py-3 font-bold text-sm border-2 rounded-xl transition-all flex items-center justify-center gap-2 bg-gray-50 border-gray-100 text-gray-300 pointer-events-none"
                                >
                                  <ShoppingCart className="w-5 h-5" /> ADD TO CART
                                </button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="pointer-events-none">
                              <p>{availableSlots.length === 0 ? "No sessions currently available" : "Please select a package above first"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <button
                          disabled={isBuyNowLoading || isAddingToCart}
                          onClick={handleAddToCart}
                          className="w-full py-3 font-bold text-sm border-2 rounded-xl transition-all flex items-center justify-center gap-2 bg-green-50 text-green-700 enabled:hover:bg-green-200 enabled:hover:border-green-700 border-green-600 disabled:bg-gray-50 disabled:border-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <AnimatePresence mode="wait">
                            {isAddingToCart ? (
                              <motion.span
                                key="load"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2"
                              >
                                <Loader2 className="w-5 h-5 animate-spin" />{" "}
                                ADDING...
                              </motion.span>
                            ) : showSuccess ? (
                              <motion.span
                                key="success"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-2 text-green-600"
                              >
                                <Check className="w-5 h-5" /> ADDED!
                              </motion.span>
                            ) : (
                              <motion.span
                                key="default"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2"
                              >
                                <ShoppingCart className="w-5 h-5" /> ADD TO CART
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                      )}
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
      </ContentFadeIn>

      {/* Right: Features & Details */}
      <ContentFadeIn className="lg:col-span-4 space-y-6">
        <ProgramFeaturesAndDetails
          features={program.features}
          details={program.details}
        />
      </ContentFadeIn>
    </div>
  );
}
