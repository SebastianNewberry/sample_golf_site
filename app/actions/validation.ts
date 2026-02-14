"use server";

import { checkTimeSlotAvailability } from "@/db/queries/bookings";
import { checkProgramSessionCapacity } from "@/db/queries/programs";

export interface ValidationResult {
  valid: boolean;
  error?: string; // Global error
  errors?: Record<string, string>; // Item-specific errors keyed by cartItemId
}

export async function validateCartAvailability(
  items: any[],
  excludeCheckoutId?: string,
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};
  let isValid = true;

  // Validate each item
  for (const item of items) {
    // Only Private Instruction items have slot metadata
    if (item.metadata) {
      try {
        const slotData = JSON.parse(item.metadata);

        // Handle single slot or array of slots
        const slots = slotData.slots || (slotData.date ? [slotData] : []);

        for (const slot of slots) {
          const baseDate = new Date(slot.date);
          const [startH, startM] = slot.startTime.split(":").map(Number);
          const [endH, endM] = slot.endTime.split(":").map(Number);

          const startDate = new Date(baseDate);
          startDate.setHours(startH, startM, 0, 0);

          const endDate = new Date(baseDate);
          endDate.setHours(endH, endM, 0, 0);

          // Check DB for overlapping confirmed bookings
          const availability = await checkTimeSlotAvailability(
            startDate,
            endDate,
            undefined, // excludeBookingId
            excludeCheckoutId,
          );

          if (!availability.available) {
            isValid = false;
            const timeStr = `${slot.date} at ${slot.startTime}`;

            if (availability.reason === "hold_active") {
              errors[item.id] =
                `The slot on ${timeStr} is currently being purchased by another customer. Please try again in 15 minutes.`;
            } else {
              errors[item.id] =
                `The slot on ${timeStr} is no longer available.`;
            }
            break; // Stop checking slots for this item if one is invalid
          }
        }
      } catch (e) {
        console.error("Error parsing metadata during validation", e);
        isValid = false;
        errors[item.id] = "Invalid item data.";
      }
    }

    // Validate Group Sessions (programSessionId) capacity
    if (item.programSessionId) {
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
  };
}
