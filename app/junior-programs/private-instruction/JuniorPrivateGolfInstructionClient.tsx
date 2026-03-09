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
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/cart/CartContext";
import { addToCart } from "@/app/actions/cart";
import { Loader2, Check, ShoppingCart, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import defaultImage from "@/public/junior_private_instruction.webp";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { SessionCalendar } from "@/app/components/SessionCalendar";
import { PrivateInstructionCalendar } from "@/app/components/PrivateInstructionCalendar";
import { Button } from "@/components/ui/button";
import { format, isSameDay } from "date-fns";

interface JuniorPrivateGolfInstructionClientProps {
  program: any;
  initialAvailableSlots: any[];
}

export function JuniorPrivateGolfInstructionClient({
  program,
  initialAvailableSlots,
}: JuniorPrivateGolfInstructionClientProps) {
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
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]); // Array of slots
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showNav, setShowNav] = useState(false);

  const { items } = useCart();

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
              date: new Date(s.date),
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

  // Helper to normalize date from UTC string/Date to comparison date
  const normalizeFromUTC = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  };

  // Use the pre-calculated available slots passed from server
  const availableSlots = useMemo(() => {
    const nowEST = getNowEST();

    return initialAvailableSlots
      .map((slot) => ({
        ...slot,
        date: new Date(slot.date), // Ensure date object
      }))
      .filter((slot) => {
        // Filter out past slots
        const slotDate = normalizeFromUTC(slot.date);
        const [h, m] = slot.startTime.split(":").map(Number);
        slotDate.setHours(h, m, 0, 0);
        return slotDate > nowEST;
      });
  }, [initialAvailableSlots]);

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
    if (selectedSlots.length === 0 || !selectedDuration) return;

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
    if (selectedSlots.length === 0 || !selectedDuration) return;

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
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          {/* Left Sidebar - Program Links + Calendar */}
          <div className="lg:col-span-3 space-y-2">
            {/* Header with program name */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Junior Private Golf Instruction
              </h1>
              <button
                onClick={() => setShowNav(!showNav)}
                className="lg:hidden flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer whitespace-nowrap"
              >
                {showNav ? "Hide Programs" : "Show Programs"}
                {showNav ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
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
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                JUNIOR DEVELOPMENTAL SERIES
              </Link>
              <Link
                href="/junior-programs/private-instruction"
                className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
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
                    className="block bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    JUNIOR DEVELOPMENTAL SERIES
                  </Link>
                  <Link
                    href="/junior-programs/private-instruction"
                    className="block bg-white border-l-4 border-orange-500 px-4 py-2.5 text-sm font-bold text-gray-800"
                  >
                    JUNIOR PRIVATE GOLF INSTRUCTION
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Session Calendar - Summary of Availability */}
            <div className="mt-6">
              <SessionCalendar
                schedule={availableSlots.map((s) => ({
                  date: s.date.toLocaleDateString("en-CA", {
                    timeZone: "America/New_York",
                  }),
                  startTime: s.startTime,
                  endTime: s.endTime,
                }))}
                hideSessionCount
              />
              <p className="text-xs text-gray-500 mt-2 px-1">
                * Dates above are available dates, but you only sign up for
                individual sessions.
              </p>
            </div>
          </div>

          {/* Main Card: Image + Description + Price */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Two-column layout: Image + Description | Pricing */}
              <div className="flex flex-col">
                {/* Image - Full Width */}
                <div className="relative bg-gray-100">
                  <Image
                    src={defaultImage}
                    alt="Junior Private Golf Instruction"
                    width={800}
                    height={500}
                    className="w-full max-h-[650px] object-cover object-bottom bg-gray-100"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8">
                  <h1 className="text-lg font-bold text-gray-900 mb-2">
                    Junior Private Golf Instruction
                  </h1>

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
                            .map((pkg: any) => (
                              <div
                                key={pkg.id}
                                onClick={() => handlePriceSelect(pkg)}
                                className={`p-2 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1 min-h-[8rem]
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
                            .map((pkg: any) => (
                              <div
                                key={pkg.id}
                                onClick={() => handlePriceSelect(pkg)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between
                                  ${
                                    selectedPackageId === pkg.id
                                      ? "bg-[hsl(var(--golf-orange))]/5 border-[hsl(var(--golf-orange))] shadow-sm"
                                      : "bg-white border-gray-100 hover:border-green-200 hover:bg-green-50 shadow-sm"
                                  }`}
                              >
                                <div>
                                  <p className="text-gray-900 font-bold text-lg">
                                    {pkg.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {pkg.playersCount === 1
                                      ? "Private Session"
                                      : `$${Math.round(pkg.price / pkg.playersCount)} / person`}
                                  </p>
                                </div>
                                <p
                                  className={`text-2xl font-bold ${selectedPackageId === pkg.id ? "text-[hsl(var(--golf-orange))]" : "text-[hsl(var(--golf-green))]"}`}
                                >
                                  ${pkg.price}
                                </p>
                              </div>
                            ))}
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

                          <Button
                            onClick={() => setIsCalendarOpen(true)}
                            className="w-full h-14 bg-white border-2 border-green-600 text-green-700 enabled:hover:bg-green-50 text-sm font-bold flex items-center justify-center gap-3 rounded-xl shadow-sm"
                            disabled={!selectedDuration}
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
                              !selectedDuration ||
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
                              !selectedDuration ||
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
                                  <ShoppingCart className="w-5 h-5" /> ADD TO
                                  CART
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
