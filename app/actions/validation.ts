"use server";

import { checkTimeSlotAvailability } from "@/db/queries/bookings";
import {
  checkProgramSessionCapacity,
  getProgramById,
  getSlotEnrollmentCount,
} from "@/db/queries/programs";
import { fromZonedTime } from "date-fns-tz";
import { formatTime12h } from "@/lib/session-schedule";
import {
  reconcileCartPricing,
  type PriceUpdate,
} from "@/lib/cart-pricing";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errors?: Record<string, string>;
  priceUpdates?: PriceUpdate[];
}

export async function validateCartAvailability(
  items: any[],
  excludeCheckoutId?: string,
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};
  let isValid = true;
  let priceUpdates: PriceUpdate[] = [];

  if (items.length > 0) {
    const reconcileResult = await reconcileCartPricing(items);
    priceUpdates = reconcileResult.priceUpdates;

    for (const [itemId, message] of Object.entries(reconcileResult.errors)) {
      isValid = false;
      errors[itemId] = message;
    }
  }

  const programCache = new Map<
    string,
    Awaited<ReturnType<typeof getProgramById>>
  >();

  for (const item of items) {
    if (errors[item.id]) continue;

    let programData = programCache.get(item.programId);
    if (programData === undefined) {
      programData = await getProgramById(item.programId);
      programCache.set(item.programId, programData);
    }

    const isSeries = programData?.schedulingType === "series";
    const isAppointment =
      programData?.schedulingType === "appointment" ||
      programData?.type === "private" ||
      programData?.type === "junior_private";

    if (item.metadata) {
      try {
        const slotData = JSON.parse(item.metadata);
        const slots = slotData.slots || (slotData.date ? [slotData] : []);

        if (isSeries) {
          const capacity = programData?.seriesCapacityPerSlot || 999;
          for (const slot of slots) {
            if (!item.programSessionId) continue;
            const enrolledCount = await getSlotEnrollmentCount(
              item.programSessionId,
              slot.date,
              slot.startTime,
            );
            if (enrolledCount >= capacity) {
              isValid = false;
              errors[item.id] =
                `The session on ${slot.date} at ${formatTime12h(slot.startTime)} is full (${capacity}/${capacity} spots taken).`;
              break;
            }
          }
        } else if (slots.length > 0 && isAppointment) {
          for (const slot of slots) {
              const startDate = fromZonedTime(
                `${slot.date} ${slot.startTime}`,
                "America/New_York",
              );
              const endDate = fromZonedTime(
                `${slot.date} ${slot.endTime}`,
                "America/New_York",
              );

              const availability = await checkTimeSlotAvailability(
                startDate,
                endDate,
                undefined,
                excludeCheckoutId,
              );

              if (!availability.available) {
                isValid = false;
                const timeStr = `${slot.date} at ${formatTime12h(slot.startTime)}`;

                if (availability.reason === "hold_active") {
                  errors[item.id] =
                    `The slot on ${timeStr} is currently being purchased by another customer. Please try again in 15 minutes.`;
                } else {
                  errors[item.id] =
                    `The slot on ${timeStr} is no longer available.`;
                }
                break;
              }
            }
        }
      } catch (e) {
        console.error("Error parsing metadata during validation", e);
        isValid = false;
        errors[item.id] = "Invalid item data.";
      }
    }

    // Group session capacity (not for series — series uses per-slot capacity above)
    if (item.programSessionId && !isSeries) {
      const capacityCheck = await checkProgramSessionCapacity(
        item.programSessionId,
        excludeCheckoutId,
      );
      if (!capacityCheck.available) {
        isValid = false;
        errors[item.id] =
          `This session is full (remaining: ${capacityCheck.remaining}).`;
      }
    }
  }

  return {
    valid: isValid,
    errors: isValid ? undefined : errors,
    error: isValid
      ? undefined
      : "Some items in your cart are no longer available.",
    priceUpdates: priceUpdates.length > 0 ? priceUpdates : undefined,
  };
}
