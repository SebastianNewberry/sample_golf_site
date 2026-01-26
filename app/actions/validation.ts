"use server";

import { checkTimeSlotAvailability } from "@/db/queries/bookings";
import { checkProgramSessionCapacity } from "@/db/queries/programs";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateCartAvailability(
  items: any[],
): Promise<ValidationResult> {
  // Validate each item
  for (const item of items) {
    // Only Private Instruction items have slot metadata
    if (item.metadata) {
      try {
        const slotData = JSON.parse(item.metadata);

        // Handle single slot or array of slots
        const slots = slotData.slots || (slotData.date ? [slotData] : []);

        for (const slot of slots) {
          // Parse times carefully matching the logic used in webhook
          // slot.date is likely YYYY-MM-DD string
          // slot.startTime is HH:mm

          const baseDate = new Date(slot.date);
          const [startH, startM] = slot.startTime.split(":").map(Number);
          const [endH, endM] = slot.endTime.split(":").map(Number);

          const startDate = new Date(baseDate);
          startDate.setHours(startH, startM, 0, 0);

          const endDate = new Date(baseDate);
          endDate.setHours(endH, endM, 0, 0);

          // Check DB for overlapping confirmed bookings
          const isAvailable = await checkTimeSlotAvailability(
            startDate,
            endDate,
          );

          if (!isAvailable) {
            return {
              valid: false,
              error: `The slot on ${slot.date} at ${slot.startTime} is no longer available. Please remove it from your cart.`,
            };
          }
        }
      } catch (e) {
        console.error("Error parsing metadata during validation", e);
        // If metadata is corrupt, we might want to block or allow?
        // Safer to block if we can't verify.
        return {
          valid: false,
          error: "Invalid cart item data. Please refresh.",
        };
      }
    }

    // Future: Validate Group Sessions (programSessionId) capacity
    if (item.programSessionId) {
      // Check db.programSession.enrolledCount < capacity
      // Logic to comes here if needed.
      const capacityCheck = await checkProgramSessionCapacity(
        item.programSessionId,
      );
      if (!capacityCheck.available) {
        return {
          valid: false,
          error: `The session is full (Remaining spots: ${capacityCheck.remaining}). Please remove it.`,
        };
      }
    }
  }

  return { valid: true };
}
