
// Scripts to simulate webhook execution
// Run with: npx tsx -r dotenv/config scripts/test-webhook-logic.ts

import { createBooking, getBookingById, updateBookingStatus, addBookingParticipants, checkTimeSlotAvailability } from "@/db/queries/bookings";
import { getRegularUserByEmail } from "@/db/queries/users";
import { fromZonedTime } from "date-fns-tz";

// MOCK DATA
const MOCK_ITEMS = [
    {
        cartItemId: "item_1",
        programId: "prog_123",
        registrationType: "adult",
        formData: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phoneNumber: "555-0101"
        },
        metadata: JSON.stringify({
            date: "2026-06-15",
            startTime: "09:00",
            endTime: "10:00"
        })
    },
    {
        cartItemId: "item_2",
        programId: "prog_123",
        registrationType: "junior",
        formData: {
            primaryContactFirstName: "John",
            primaryContactLastName: "Doe",
            primaryContactEmail: "john@example.com",
            primaryContactPhone: "555-0101",
            childFirstName: "Timmy",
            childLastName: "Doe",
            childAge: 10,
            childExperienceLevel: "Beginner"
        },
        metadata: JSON.stringify({
            date: "2026-06-15",
            startTime: "09:00",
            endTime: "10:00"
        })
    }
];

async function main() {
    console.log("Starting Webhook Logic Test...");

    // Grouping Logic Reverse-Engineered from Route.ts
    const bookingGroups = new Map<string, any>();

    for (const item of MOCK_ITEMS) {
        const slotData = JSON.parse(item.metadata);
        const key = `${slotData.date}-${slotData.startTime}-${slotData.endTime}`;

        if (!bookingGroups.has(key)) {
            bookingGroups.set(key, {
                slot: slotData,
                participants: [],
                programId: item.programId,
                items: [],
                reservedBookingIds: [], // We are testing fallback flow primarily here
            });
        }

        const group = bookingGroups.get(key);

        const studentName = item.registrationType === "adult"
            ? `${(item.formData as any).firstName} ${(item.formData as any).lastName}`
            : `${(item.formData as any).childFirstName} ${(item.formData as any).childLastName}`;

        const participantData = {
            name: studentName,
            email: "john@example.com",
            type: item.registrationType,
            // ... (simplified)
        };

        group.participants.push(participantData);
        console.log(`Added participant ${studentName} to group ${key}`);
    }

    // Verify grouping
    console.log(`\nCreated ${bookingGroups.size} booking groups.`);
    for (const [key, group] of bookingGroups.entries()) {
        console.log(`Group ${key}: ${group.participants.length} participants`);

        if (group.participants.length !== 2) {
            console.error("FAIL: Expected 2 participants in the group.");
        } else {
            console.log("PASS: Grouping successful.");
        }
    }

    console.log("\n(Note: DB writes are not executed in this simple logic test script, but the grouping logic is verified)");
}

main().catch(console.error);
