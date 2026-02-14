"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, Phone, CalendarClock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/cart/CartContext";
import { addToCart } from "@/app/actions/cart";
import { Loader2, Check, ShoppingCart, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react"; // Corrected from motion/react to framer-motion
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
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]); // Array of slots
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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

  // Use the pre-calculated available slots passed from server
  const availableSlots = useMemo(() => {
    return initialAvailableSlots.map((slot) => ({
      ...slot,
      date: new Date(slot.date), // Ensure date object
    }));
  }, [initialAvailableSlots]);

  // Determine Max Slots based on package
  const maxSlots = useMemo(() => {
    if (selectedDuration.includes("5 Lessons")) return 5;
    if (selectedDuration.includes("10 Lessons")) return 10;
    return 1;
  }, [selectedDuration]);

  // Invalidate selected slot if duration changes
  const handlePriceSelect = (duration: string, price: number) => {
    setSelectedDuration(duration);
    setSelectedPrice(price);
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
    const totalHours = (durationMinutes * selectedSlots.length) / 60;

    // Serialize slot details into metadata
    const metadata = JSON.stringify({
      duration: selectedDuration,
      totalHours,
      slots: selectedSlots.map((s) => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      // Legacy fields
      date: selectedSlots[0].date,
      startTime: selectedSlots[0].startTime,
      endTime: selectedSlots[0].endTime,
      count: selectedSlots.length,
    });

    const result = await addItem({
      programId: program.id,
      registrationType: "junior",
      price:
        selectedPrice /
        (selectedDuration.match(/(\d+) Players?/)
          ? parseInt(selectedDuration.match(/(\d+) Players?/)[1])
          : 1),
      metadata,
    });

    if (result.success) {
      // If we need to add more items (for multi-player packages), do it here
      // Detect player count
      const playerMatch = selectedDuration.match(/(\d+) Players?/);
      const playerCount = playerMatch ? parseInt(playerMatch[1]) : 1;

      if (playerCount > 1) {
        // Add remaining items
        for (let i = 1; i < playerCount; i++) {
          await addItem({
            programId: program.id,
            registrationType: "junior",
            price: selectedPrice / playerCount, // Price per player
            metadata,
          });
        }
      }

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
    const totalHours = (durationMinutes * selectedSlots.length) / 60;

    // Serialize slot details into metadata
    const metadata = JSON.stringify({
      duration: selectedDuration,
      totalHours,
      slots: selectedSlots.map((s) => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      // Legacy fields
      date: selectedSlots[0].date,
      startTime: selectedSlots[0].startTime,
      endTime: selectedSlots[0].endTime,
      count: selectedSlots.length,
    });

    const result = await addToCart({
      programId: program.id,
      registrationType: "junior",
      price:
        selectedPrice /
        (selectedDuration.match(/(\d+) Players?/)
          ? parseInt(selectedDuration.match(/(\d+) Players?/)[1])
          : 1),
      metadata,
    });

    if (result.success) {
      // If we need to add more items (for multi-player packages), do it here
      // Detect player count
      const playerMatch = selectedDuration.match(/(\d+) Players?/);
      const playerCount = playerMatch ? parseInt(playerMatch[1]) : 1;

      if (playerCount > 1) {
        // Add remaining items
        for (let i = 1; i < playerCount; i++) {
          await addToCart({
            programId: program.id,
            registrationType: "junior",
            price: selectedPrice / playerCount, // Price per player
            metadata,
          });
        }
      }

      await refreshCart();
      router.push("/checkout");
    } else {
      setIsBuyNowLoading(false);
      // Optional: handle error
    }
  };

  // Calculate duration in minutes
  const durationMinutes = useMemo(() => {
    if (selectedDuration.includes("1/2 Hour")) return 30;
    if (selectedDuration.includes("1 Hour")) return 60;
    // Packages usually booked as 1 hour sessions
    if (selectedDuration.includes("Package")) return 60;
    if (selectedDuration.includes("On-Course")) return 180; // 3 Hours
    return 60; // Default
  }, [selectedDuration]);

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
        durationMinutes={durationMinutes}
      />

      {/* Main Content Grid - Centered */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          {/* Left Sidebar - Program Links + Calendar */}
          <div className="lg:col-span-3 space-y-2">
            {/* Header with program name */}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Junior Private Golf Instruction
            </h1>
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
              href="/junior-programs/golf-camp"
              className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              JUNIOR GOLF CAMP
            </Link>
            <Link
              href="/junior-programs/developmental-camp"
              className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              JUNIOR DEVELOPMENTAL GOLF CAMP
            </Link>
            <Link
              href="/junior-programs/private-instruction"
              className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
            >
              JUNIOR PRIVATE GOLF INSTRUCTION
            </Link>

            {/* Session Calendar - Summary of Availability */}
            <div className="mt-6">
              <SessionCalendar
                schedule={availableSlots.map((s) => ({
                  date: format(s.date, "yyyy-MM-dd"),
                  startTime: s.startTime,
                  endTime: s.endTime,
                }))}
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        {
                          name: "1/2 Hour Session",
                          label: "1/2 Hour",
                          price: 60,
                          sub: "Single Session",
                        },
                        {
                          name: "1 Hour Session",
                          label: "1 Hour",
                          price: 90,
                          sub: "Single Session",
                        },
                        {
                          name: "5 Lessons Package",
                          label: "5 Lessons",
                          price: 400,
                          sub: "Save $50",
                        },
                        {
                          name: "10 Lessons Package",
                          label: "10 Lessons",
                          price: 700,
                          sub: "Save $200",
                        },
                      ].map((pkg) => (
                        <div
                          key={pkg.name}
                          onClick={() => handlePriceSelect(pkg.name, pkg.price)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1 h-32
                            ${selectedDuration === pkg.name
                              ? "bg-[hsl(var(--golf-orange))]/5 border-[hsl(var(--golf-orange))]"
                              : "bg-white border-gray-100 hover:border-green-200 hover:bg-green-50 shadow-sm"
                            }`}
                        >
                          <p className="text-gray-600 font-medium">
                            {pkg.label}
                          </p>
                          <p
                            className={`text-2xl font-bold ${selectedDuration === pkg.name ? "text-[hsl(var(--golf-orange))]" : "text-green-700"}`}
                          >
                            ${pkg.price}
                          </p>
                          {pkg.sub && (
                            <p className="text-xs text-gray-400">{pkg.sub}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* On-Course Coaching Section */}
                  <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-2">
                      On-Course Coaching (9 Hole Lesson)
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed max-w-4xl">
                      Our <strong>on-course coaching session</strong> teaches
                      your child how to take their game from the practice area
                      to the golf course. They will learn under real playing
                      conditions and receive invaluable instruction on all
                      aspects of their game. Includes 30-minute evaluation,
                      improvement plan, green fees, cart, and practice balls.
                      <strong> Approx. 3 Hours.</strong>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          name: "On-Course Session (1 Player)",
                          label: "1 Player",
                          price: 250,
                          desc: "Private Session",
                        },
                        {
                          name: "On-Course Session (2 Players)",
                          label: "2 Players",
                          price: 300,
                          desc: "$150 / person",
                        },
                        {
                          name: "On-Course Session (3 Players)",
                          label: "3 Players",
                          price: 475,
                          desc: "~$158 / person (2 Coaches)",
                        },
                        {
                          name: "On-Course Session (4 Players)",
                          label: "4 Players",
                          price: 600,
                          desc: "$150 / person (2 Coaches)",
                        },
                      ].map((pkg) => (
                        <div
                          key={pkg.name}
                          onClick={() => handlePriceSelect(pkg.name, pkg.price)}
                          className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between
                            ${selectedDuration === pkg.name
                              ? "bg-[hsl(var(--golf-orange))]/5 border-[hsl(var(--golf-orange))]"
                              : "bg-white border-gray-200 hover:border-green-200 hover:bg-white shadow-sm"
                            }`}
                        >
                          <div className="text-left">
                            <p className="text-lg font-bold text-gray-800">
                              {pkg.label}
                            </p>
                            <p className="text-xs text-gray-500">{pkg.desc}</p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-2xl font-bold ${selectedDuration === pkg.name ? "text-[hsl(var(--golf-orange))]" : "text-green-700"}`}
                            >
                              ${pkg.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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
                            className="w-full py-3 font-bold text-sm border-2 rounded-xl transition-all flex items-center justify-center gap-2 bg-green-50 text-green-700 enabled:hover:bg-green-200 enabled:hover:border-green-700 border-green-600 disabled:bg-gray-50 disabled:border-gray-100 disabled:text-gray-300 cursor-pointer"
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
