"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Trash2,
    Minus,
    Plus,
    ShoppingCart,
    ArrowRight,
    Loader2,
    Calendar,
    Clock,
} from "lucide-react";
import { parseSchedule, formatTime12h } from "@/lib/session-schedule";
import { validateCartAvailability } from "@/app/actions/validation";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

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
    const { items, total, isLoading, removeItem, updateQuantity, clearCart } =
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

        // Helper to format date in Eastern Time
        const formatDateInEastern = (dateString: string): string => {
            const date = parseDate(dateString);
            return date.toLocaleDateString("en-US", {
                timeZone: "America/New_York",
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        };

        // Helper to get day of week in Eastern Time
        const getDayOfWeekInEastern = (dateString: string): string => {
            const date = parseDate(dateString);
            return date.toLocaleDateString("en-US", {
                timeZone: "America/New_York",
                weekday: "long",
            });
        };

        // Format date range
        const dateRange = `${formatDateInEastern(sortedSchedule[0].date)} - ${formatDateInEastern(sortedSchedule[sortedSchedule.length - 1].date)}`;

        // Group recurring sessions
        const groups: Record<string, { day: string; time: string; dates: Date[] }> =
            {};

        sortedSchedule.forEach((s) => {
            const date = parseDate(s.date);
            const dayName = getDayOfWeekInEastern(s.date);
            const timeRange = `${formatTime12h(s.startTime)} - ${formatTime12h(s.endTime)}`;
            const key = `${dayName}-${timeRange}`;

            if (!groups[key]) {
                groups[key] = {
                    day: dayName,
                    time: timeRange,
                    dates: [],
                };
            }
            groups[key].dates.push(date);
        });

        const groupedSchedule = Object.values(groups).map((group) => {
            group.dates.sort((a, b) => a.getTime() - b.getTime());
            const firstDate = group.dates[0];
            const lastDate = group.dates[group.dates.length - 1];

            const formatDateShort = (d: Date) =>
                d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });

            const dateRangeStr =
                group.dates.length > 1
                    ? `${formatDateShort(firstDate)} - ${formatDateShort(lastDate)}`
                    : formatDateShort(firstDate);

            // Pluralize day if multiple
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
            dateRange,
            groupedSchedule,
        };
    };

    // Helper to format private instruction metadata for display
    const formatPrivateInstructionMetadata = (metadataJson: string | null) => {
        if (!metadataJson) return null;
        try {
            const metadata = JSON.parse(metadataJson);
            if (!metadata.slots || !Array.isArray(metadata.slots)) return null;

            // Parse dates from metadata slots
            const formattedSlots = metadata.slots.map((slot: any) => {
                // Parse date string (YYYY-MM-DD) to Local Date object to avoid UTC shifts
                const [year, month, day] = slot.date.split("-").map(Number);
                const date = new Date(year, month - 1, day);

                return {
                    date: date.toLocaleDateString("en-US", {
                        // We use the date object which represents 00:00 local time on that day
                        // Displaying it with a timezone might shift it if the local machine is not in that timezone
                        // BUT since we manually constructed it as local 00:00, toLocaleDateString without timezone IANA 
                        // might use browser's timezone.
                        // Ideally we want to just format it as the date string says.
                        // However, to be consistent with existing styling we use these options.
                        // Specifying 'America/New_York' on a manually constructed local date (which effectively usually means local to user)
                        // might shift it if user is NOT in EST?
                        // Actually, if we just want "Feb 18, 2026", and we have "2026-02-18",
                        // we can strictly format the string parts.
                        // But let's stick to the Date object method but ensure it doesn't shift.
                        // Simple fix: Add 12 hours to be in the middle of the day.

                        // Revised approach:
                        // Just use the parsing logic which creates a local date.
                        // format options -> "short" month, numeric day.
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    }),
                    time: `${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`,
                };
            });

            return {
                duration: metadata.duration,
                totalHours: metadata.totalHours,
                sessionCount: metadata.slots.length,
                slots: formattedSlots,
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
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="text-4xl font-bold text-gray-800">Shopping Cart</h1>
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
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item) => {
                                const scheduleInfo = item.session
                                    ? formatSessionSchedule(item.session.schedule)
                                    : null;

                                const privateInfo = PRIVATE_INSTRUCTION_IDS.includes(
                                    item.programId,
                                )
                                    ? formatPrivateInstructionMetadata(item.metadata)
                                    : null;

                                const isPrivate = PRIVATE_INSTRUCTION_IDS.includes(
                                    item.programId,
                                );

                                const programImage =
                                    item.program?.imageUrl || PROGRAM_IMAGE_MAP[item.programId];

                                // Calculate availability
                                let maxQuantity = Infinity;
                                let isSoldOut = false;
                                let hasInsufficientQuantity = false;

                                if (item.session) {
                                    const enrolled = item.session.enrolledCount ?? 0;
                                    maxQuantity = Math.max(0, item.session.capacity - enrolled);
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
                                    <div key={item.id}>
                                        <Card
                                            className={`p-8 bg-white shadow-md transition-all ${hasError
                                                ? "border-2 border-red-500 ring-4 ring-red-50"
                                                : ""
                                                }`}
                                        >
                                            <div className="flex gap-6">
                                                {/* Program Image */}
                                                <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0 relative">
                                                    {programImage ? (
                                                        <Image
                                                            src={programImage}
                                                            alt={item.program?.name || "Program"}
                                                            fill
                                                            className="object-cover"
                                                            sizes="128px"
                                                            priority
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                                                            <span className="text-white text-3xl font-bold">
                                                                {item.program?.type === "junior" ? "J" : "A"}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Program Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-gray-800 text-xl">
                                                                {item.program?.name || "Program"}
                                                            </h3>
                                                            <p className="text-base text-gray-600 mt-2">
                                                                {item.registrationType === "junior"
                                                                    ? "Junior Program"
                                                                    : "Adult Program"}
                                                            </p>
                                                            {item.session && (
                                                                <div className="mt-3 space-y-2">
                                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                                        <Calendar
                                                                            size={16}
                                                                            className="text-green-600"
                                                                        />
                                                                        <span className="font-semibold">
                                                                            {item.session.name}
                                                                            {scheduleInfo &&
                                                                                ` - ${scheduleInfo.sessionCount} Sessions`}
                                                                        </span>
                                                                    </div>
                                                                    {scheduleInfo && (
                                                                        <div className="mt-4 space-y-3">
                                                                            <div className="pl-1 space-y-3">
                                                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                                    Schedule:
                                                                                </p>
                                                                                {scheduleInfo.groupedSchedule.map(
                                                                                    (group: any, idx: number) => (
                                                                                        <div
                                                                                            key={idx}
                                                                                            className="border-l-2 border-green-200 pl-3 py-1"
                                                                                        >
                                                                                            <div className="flex items-baseline justify-between gap-4">
                                                                                                <span className="font-bold text-gray-800 text-sm">
                                                                                                    {group.dayLabel} at{" "}
                                                                                                    {group.timeRange}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="text-xs text-gray-600 mt-1">
                                                                                                {group.dateRange}
                                                                                                {group.count > 1 && (
                                                                                                    <span className="text-gray-400 ml-1">
                                                                                                        ({group.count} sessions)
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Private Instruction Metadata */}
                                                            {privateInfo && (
                                                                <div className="mt-4 space-y-3">
                                                                    <div className="flex items-center gap-2 text-sm text-gray-800 font-semibold bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 w-fit">
                                                                        <Clock
                                                                            size={16}
                                                                            className="text-orange-600"
                                                                        />
                                                                        <span>{privateInfo.duration}</span>
                                                                        <span className="text-gray-400 mx-1">
                                                                            •
                                                                        </span>
                                                                        <span className="text-green-700">
                                                                            {privateInfo.totalHours ||
                                                                                privateInfo.sessionCount * 1}{" "}
                                                                            hrs total
                                                                        </span>
                                                                    </div>

                                                                    <div className="space-y-1.5 pl-1">
                                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                                            Scheduled Sessions:
                                                                        </p>
                                                                        {privateInfo.slots.map(
                                                                            (slot: any, idx: number) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    className="flex items-center gap-3 text-sm text-gray-700 group"
                                                                                >
                                                                                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-[10px] font-bold text-green-700 border border-green-100 shrink-0">
                                                                                        {idx + 1}
                                                                                    </div>
                                                                                    <div className="flex gap-2 items-baseline">
                                                                                        <span className="font-medium">
                                                                                            {slot.date}
                                                                                        </span>
                                                                                        <span className="text-gray-400 text-xs">
                                                                                            at
                                                                                        </span>
                                                                                        <span className="text-gray-600 font-medium">
                                                                                            {slot.time}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-gray-400 enabled:hover:text-red-600 transition-colors p-1 flex-shrink-0 cursor-pointer"
                                                            aria-label="Remove item"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() =>
                                                                    updateQuantity(item.id, item.quantity - 1)
                                                                }
                                                                disabled={item.quantity <= 1 || isPrivate}
                                                                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors shrink-0 ${item.quantity <= 1 || isPrivate
                                                                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                                                    : "border-gray-300 enabled:hover:bg-gray-100 cursor-pointer"
                                                                    }`}
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                            <div className="w-14 h-10 flex items-center justify-center">
                                                                <span className="font-bold text-lg">
                                                                    {item.quantity}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    // Capacity Check
                                                                    if (item.session) {
                                                                        const enrolled =
                                                                            item.session.enrolledCount ?? 0;
                                                                        const maxAvailable =
                                                                            item.session.capacity - enrolled;
                                                                        if (item.quantity + 1 > maxAvailable) {
                                                                            return;
                                                                        }
                                                                    }
                                                                    updateQuantity(item.id, item.quantity + 1);
                                                                }}
                                                                disabled={(() => {
                                                                    if (isPrivate) return true;
                                                                    if (item.session) {
                                                                        const enrolled =
                                                                            item.session.enrolledCount ?? 0;
                                                                        const maxAvailable =
                                                                            item.session.capacity - enrolled;
                                                                        return item.quantity >= maxAvailable;
                                                                    }
                                                                    return false;
                                                                })()}
                                                                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors shrink-0 ${(() => {
                                                                    if (isPrivate) return true;
                                                                    if (item.session) {
                                                                        const enrolled =
                                                                            item.session.enrolledCount ?? 0;
                                                                        const maxAvailable =
                                                                            item.session.capacity - enrolled;
                                                                        return item.quantity >= maxAvailable;
                                                                    }
                                                                    return false;
                                                                })()
                                                                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                                                    : "border-gray-300 enabled:hover:bg-gray-100 cursor-pointer"
                                                                    }`}
                                                                aria-label="Increase quantity"
                                                                title={(() => {
                                                                    if (isPrivate)
                                                                        return "Cannot change quantity for private instruction";
                                                                    if (item.session) {
                                                                        const enrolled =
                                                                            item.session.enrolledCount ?? 0;
                                                                        const maxAvailable =
                                                                            item.session.capacity - enrolled;
                                                                        if (item.quantity >= maxAvailable)
                                                                            return "Session capacity reached";
                                                                    }
                                                                    return "Add another";
                                                                })()}
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="flex flex-col items-end min-h-[3.5rem] justify-center">
                                                            <p className="text-2xl font-bold text-green-700 leading-tight">
                                                                $
                                                                {(
                                                                    parseFloat(item.priceAtAdd) * item.quantity
                                                                ).toFixed(2)}
                                                            </p>
                                                            {item.quantity > 1 && (
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    ${item.priceAtAdd} each
                                                                </p>
                                                            )}
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
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="p-8 bg-white sticky top-8 shadow-md">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Order Summary
                                </h2>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-base text-gray-600">
                                        <span>
                                            Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)}{" "}
                                            items)
                                        </span>
                                        <span className="font-semibold">${total.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between text-2xl font-bold text-gray-800">
                                            <span>Total</span>
                                            <span className="text-green-700">
                                                ${total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
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
        </div>
    );
}
