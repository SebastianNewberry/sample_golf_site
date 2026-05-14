"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Phone,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/cart/CartContext";
import { addToCart } from "@/app/actions/cart";
import { Loader2, Check, ShoppingCart, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  const [showNav, setShowNav] = useState(false);

  // The first active session is the current series
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.isActive) || sessions[0];
  }, [sessions]);

  const { items } = useCart();

  // Parse pricing options (already parsed from server)
  const pricingOptions = program.pricingOptions || [];

  // Max slots based on selected package
  const maxSlots = selectedSessionCount || 1;

  // Build available slots from the session schedule
  const availableSlots = useMemo<SeriesSlot[]>(() => {
    if (!activeSession?.schedule) return [];

    try {
      const schedule =
        typeof activeSession.schedule === "string"
          ? JSON.parse(activeSession.schedule)
          : activeSession.schedule;

      if (!Array.isArray(schedule)) return [];

      return schedule.map(
        (entry: { date: string; startTime: string; endTime: string }) => ({
          date: entry.date,
          startTime: entry.startTime,
          endTime: entry.endTime,
        }),
      );
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
  }, [activeSession, slotEnrollmentData, availableSlots, program.seriesCapacityPerSlot]);

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
    <>
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Junior Developmental Series
          </h1>
          <button
            onClick={() => setShowNav(!showNav)}
            className="lg:hidden flex items-center self-center gap-0.5 text-[9px] font-semibold text-gray-500 hover:text-gray-700 transition-colors px-1.5 py-0.5 rounded-md hover:bg-gray-100 cursor-pointer whitespace-nowrap"
          >
            {showNav ? "Hide Programs" : "Show Programs"}
            {showNav ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Desktop nav links */}
        <div className="hidden lg:block space-y-0">
          <Link
            href="/junior-programs/beginner-series"
            className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            JUNIOR BEGINNER SERIES
          </Link>
          <Link
            href="/junior-programs/developmental-series"
            className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
          >
            JUNIOR DEVELOPMENTAL SERIES
          </Link>
          <Link
            href="/junior-programs/private-instruction"
            className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            JUNIOR PRIVATE GOLF INSTRUCTION
          </Link>
        </div>

        {/* Mobile animated nav */}
        <AnimatePresence>
          {showNav && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="lg:hidden overflow-hidden space-y-0 mb-2"
            >
              <Link
                href="/junior-programs/beginner-series"
                className="block bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                JUNIOR BEGINNER SERIES
              </Link>
              <Link
                href="/junior-programs/developmental-series"
                className="block bg-white border-l-4 border-orange-500 px-4 py-2.5 text-sm font-bold text-gray-800"
              >
                JUNIOR DEVELOPMENTAL SERIES
              </Link>
              <Link
                href="/junior-programs/private-instruction"
                className="block bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                JUNIOR PRIVATE GOLF INSTRUCTION
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar preview of available dates */}
        <div className="mt-6">
          <SessionCalendar
            schedule={availableSlots.map((s) => ({
              date: s.date,
              startTime: s.startTime,
              endTime: s.endTime,
            }))}
            hideSessionCount
          />
          <p className="text-xs text-gray-500 mt-2 px-1">
            * Dates shown are available sessions — select a package and pick
            your dates.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="lg:col-span-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col">
            {/* Image */}
            <div className="relative bg-gray-100">
              <img
                src="/junior_development_series.gif"
                alt="Junior Developmental Series"
                className="w-full max-h-[400px] object-cover bg-gray-100"
              />
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
                  principles learned in{" "}
                  <strong>Junior Beginner Series</strong>.
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
                    {pricingOptions.map((pkg: any) => (
                      <div
                        key={pkg.id}
                        onClick={() => handlePriceSelect(pkg)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1 min-h-[8rem]
                          ${
                            selectedPackageId === pkg.id
                              ? "bg-[hsl(var(--golf-orange))]/5 border-[hsl(var(--golf-orange))] shadow-sm"
                              : "bg-white border-gray-100 hover:border-green-200 hover:bg-green-50 shadow-sm"
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
                    ))}
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

                      <Button
                        onClick={() => setIsCalendarOpen(true)}
                        className="w-full h-14 bg-white border-2 border-green-600 text-green-700 enabled:hover:bg-green-50 text-sm font-bold flex items-center justify-center gap-3 rounded-xl shadow-sm"
                        disabled={!selectedPackageId}
                      >
                        <CalendarClock className="w-6 h-6" />
                        {selectedSlots.length > 0
                          ? "Edit Dates"
                          : "Open Calendar"}
                      </Button>
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
                      <button
                        disabled={
                          selectedSlots.length < maxSlots ||
                          !selectedPackageId ||
                          isBuyNowLoading ||
                          isAddingToCart
                        }
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

                      <button
                        disabled={
                          selectedSlots.length < maxSlots ||
                          !selectedPackageId ||
                          isBuyNowLoading ||
                          isAddingToCart
                        }
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
                    </div>
                  </div>
                </div>

                {/* Call Option */}
                <div className="mt-8 pt-6 border-t flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-gray-500 mb-3 bg-white px-3 -mt-9">
                    OR
                  </span>
                  <a
                    href="tel:+12035098060"
                    className="flex items-center gap-3 px-8 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 font-semibold text-sm">
                      Call to Register: (203) 509-8060
                    </span>
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
          features={program.features}
          details={program.details}
        />
      </div>
    </>
  );
}
