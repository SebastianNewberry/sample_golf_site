import { headers } from "next/headers";
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { sendRegistrationConfirmationEmail } from "@/lib/email";
import {
  updateAdultRegistrationPaymentStatus,
  createAdultRegistration,
} from "@/db/queries/adult-registrations";
import {
  updateJuniorProgramRegistrationPaymentStatus,
  createJuniorRegistration,
  createJuniorProgramRegistration,
} from "@/db/queries/junior-registrations";
import { getOrCreateRegularUser, getRegularUserByEmail } from "@/db/queries/users";
import {
  getCheckoutSessionByPaymentIntentId,
  getCheckoutSessionByCheckoutId,
  completeCheckoutSession,
  updateCheckoutSessionPaymentIntent,
} from "@/db/queries/checkout-sessions";
import { deleteCart } from "@/db/queries/cart";
import {
  createBooking,
  checkTimeSlotAvailability,
  updateBookingStatus,
  addBookingParticipants,
  getBookingById,
} from "@/db/queries/bookings";
import { checkProgramSessionCapacity, getProgramById } from "@/db/queries/programs";
import { fromZonedTime } from "date-fns-tz";
import { getProgramSessionById } from "@/db/queries/programs";
import { deleteBooking } from "@/db/queries/bookings";
import { formatTime12h } from "@/lib/session-schedule";

/**
 * Stripe webhook handler
 * Processes payment events to create registrations and update status
 *
 * Security:
 * - Verifies webhook signature before processing
 * - Creates registrations ONLY after payment succeeds
 * - Handles duplicate webhook deliveries gracefully (idempotent)
 */
export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") as string;

  console.log("[Webhook] Received Stripe webhook request");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Stripe webhook secret is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;
      case "payment_intent.canceled":
        await handlePaymentIntentCanceled(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

/**
 * Handle successful payment
 * Creates registrations for cart checkouts
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log(
    `[Webhook] Payment succeeded: ${paymentIntent.id}. Metadata:`,
    JSON.stringify(paymentIntent.metadata),
  );

  const metadata = paymentIntent.metadata;

  // Only handle cart checkout flow
  if (metadata.type === "cart_checkout") {
    await handleCartCheckoutSuccess(paymentIntent);
    return;
  }

  console.log("Unknown payment type:", metadata.type);
}

/**
 * Handle cart checkout success - creates all registrations
 */
async function handleCartCheckoutSuccess(paymentIntent: any) {
  const metadata = paymentIntent.metadata;
  const checkoutId = metadata.checkoutId;
  const cartId = metadata.cartId;

  console.log(`Processing cart checkout: ${checkoutId}`);

  // Get checkout session with form data
  let checkoutSession = await getCheckoutSessionByPaymentIntentId(
    paymentIntent.id,
  );

  // Fallback: If not found by PI, try finding by checkout ID (Race condition fix)
  if (!checkoutSession && checkoutId) {
    checkoutSession = await getCheckoutSessionByCheckoutId(checkoutId);

    // If found, we should link the PI for future reference
    if (checkoutSession && !checkoutSession.stripePaymentIntentId) {
      await updateCheckoutSessionPaymentIntent(checkoutId, paymentIntent.id);
    }
  }

  if (!checkoutSession) {
    console.error(
      `No checkout session found for payment intent ${paymentIntent.id} or checkout ID ${checkoutId}`,
    );
    return;
  }

  // Check if already processed (idempotency)
  if (checkoutSession.status === "completed") {
    console.log(`Checkout session ${checkoutId} already completed`);
    return;
  }

  const formData = checkoutSession.formData;
  const paymentAmount = (paymentIntent.amount / 100).toFixed(2);
  const pricePerItem =
    formData.items.length > 0
      ? (paymentIntent.amount / 100 / formData.items.length).toFixed(2)
      : paymentAmount;

  // ------------------------------------------------
  // RESERVATION IDS (Private & Group)
  // ------------------------------------------------
  let reservationBookingIds: string[] = []; // Private Instruction Holds
  let groupRegistrationIds: string[] = []; // Group Session Holds

  try {
    if (metadata.reservationBookingIds) {
      reservationBookingIds = JSON.parse(metadata.reservationBookingIds);
    }
  } catch (e) {
    console.error("Failed to parse reservationBookingIds", e);
  }

  try {
    if (metadata.groupRegistrationIds) {
      groupRegistrationIds = JSON.parse(metadata.groupRegistrationIds);
    }
  } catch (e) {
    console.error("Failed to parse groupRegistrationIds", e);
  }

  // Track indices for consumption
  let reservationBookingIndex = 0;
  let groupRegistrationIndex = 0;

  // Process each item in the checkout
  for (const [index, item] of formData.items.entries()) {
    try {
      const itemWithMetadata = item as typeof item & { metadata?: string };
      const isPrivate = !!itemWithMetadata.metadata;
      const isGroup = !isPrivate && !!item.programId;

      // ---------------------------------------------------
      // CASE 1: Private Instruction (Create Reg + Confirm Booking)
      // ---------------------------------------------------
      if (isPrivate) {
        // 1. Create Registration (Always Fresh for Private)
        if (item.registrationType === "adult") {
          await createAdultRegistrationFromCheckout(
            item,
            paymentIntent.id,
            paymentIntent.customer as string | undefined,
            pricePerItem,
          );
        } else if (item.registrationType === "junior") {
          await createJuniorRegistrationFromCheckout(
            item,
            paymentIntent.id,
            paymentIntent.customer as string | undefined,
            pricePerItem,
          );
        }
      }
    } catch (error) {
      console.error(
        `[Webhook] Error processing item ${index} (${item.cartItemId}):`,
        error,
      );
      // Continue processing other items even if one fails
    }
  }

  // ------------------------------------------------
  // PROCESS PRIVATE BOOKINGS (Grouped by Time Slot)
  // ------------------------------------------------
  // We need to group items by time slot to merge multiple participants into one booking
  const bookingGroups = new Map<string, {
    slot: { date: string; startTime: string; endTime: string };
    participants: any[];
    programId: string;
    items: any[];
    reservedBookingIds: string[];
  }>();

  // Re-iterate to build groups
  let resBookingIndexForGroup = 0;

  for (const item of formData.items) {
    const itemWithMetadata = item as typeof item & { metadata?: string };
    const isPrivate = !!itemWithMetadata.metadata;

    if (isPrivate) {
      try {
        const slotData = JSON.parse(itemWithMetadata.metadata as string);
        const slots = slotData.slots || (slotData.date ? [slotData] : []);

        // consume reserved ID(s) for this item
        // If an item has multiple slots (e.g. package), it consumes multiple IDs
        const itemReservedIds = [];
        for (let i = 0; i < slots.length; i++) {
          if (reservationBookingIds[resBookingIndexForGroup]) {
            itemReservedIds.push(reservationBookingIds[resBookingIndexForGroup]);
            resBookingIndexForGroup++;
          }
        }

        // Add to groups
        slots.forEach((slot: any, idx: number) => {
          // Key by unique time slot
          const key = `${slot.date}-${slot.startTime}-${slot.endTime}`;

          if (!bookingGroups.has(key)) {
            bookingGroups.set(key, {
              slot,
              participants: [],
              programId: item.programId,
              items: [],
              reservedBookingIds: [],
            });
          }

          const group = bookingGroups.get(key)!;

          // Extract participant info
          let userEmail = "";
          let studentName = "";
          let bookingType = item.registrationType;

          if (item.registrationType === "adult") {
            const adultData = item.formData as any;
            userEmail = adultData.email;
            studentName = `${adultData.firstName} ${adultData.lastName}`;
          } else {
            const juniorData = item.formData as any;
            userEmail = juniorData.primaryContactEmail;
            studentName = `${juniorData.childFirstName} ${juniorData.childLastName}`;
          }

          const participantData = {
            name: studentName,
            email: userEmail,
            type: bookingType,
            ...(bookingType === "junior"
              ? {
                childFirstName: (item.formData as any).childFirstName,
                childLastName: (item.formData as any).childLastName,
                primaryContactFirstName: (item.formData as any).primaryContactFirstName,
                primaryContactLastName: (item.formData as any).primaryContactLastName,
                primaryContactEmail: (item.formData as any).primaryContactEmail,
                primaryContactPhone: (item.formData as any).primaryContactPhone,
                childAge: (item.formData as any).childAge,
                childExperienceLevel: (item.formData as any).childExperienceLevel,
                // New Fields
                phoneType: (item.formData as any).phoneType,
                preferredContactMethod: (item.formData as any).preferredContactMethod,
                hasOwnClubs: (item.formData as any).hasOwnClubs,
                friendsToGroupWith: (item.formData as any).friendsToGroupWith,
                additionalComments: (item.formData as any).additionalComments,
              }
              : {
                // Adult specific fields for registration
                firstName: (item.formData as any).firstName,
                lastName: (item.formData as any).lastName,
                phoneNumber: (item.formData as any).phoneNumber,
                email: (item.formData as any).email,
                phoneType: null, // Optional or null for adult
                preferredContactMethod: null,
                hasOwnClubs: false, // Default or add to form?
                additionalComments: (item.formData as any).additionalComments,
              }),
          };

          group.participants.push(participantData);
          group.items.push(item); // Keep track of items responsible

          // Assign one reserved ID to this slot if available from this item's allocation
          if (itemReservedIds[idx]) {
            group.reservedBookingIds.push(itemReservedIds[idx]);
          }
        });

      } catch (e) {
        console.error("Error parsing private slot metadata for grouping", e);
      }
    }
  }

  // Process Groups
  for (const [key, group] of bookingGroups.entries()) {
    try {
      const { slot, participants, reservedBookingIds, programId } = group;

      let primaryBookingId = reservedBookingIds[0]; // Pick the first one as primary
      const secondaryBookingIds = reservedBookingIds.slice(1); // The rest are redundant

      let confirmed = false;

      // 1. Try to use Primary Reserved Booking
      if (primaryBookingId) {
        try {
          const booking = await getBookingById(primaryBookingId);
          if (booking && booking.status === "pending_payment") {
            // Construction Combined Notes
            const notes = [
              `Private Lesson Group (${participants.length} participants)`,
              ...participants.map(p => `- ${p.name} (${p.type})`),
              `Date: ${slot.date} ${slot.startTime}`,
              `Program ID: ${programId}`
            ].join("\n");

            // Confirm Primary
            await updateBookingStatus(primaryBookingId, "confirmed", { notes });

            // Add ALL participants
            await addBookingParticipants(primaryBookingId, participants);

            confirmed = true;
            console.log(`[Webhook] Confirmed PRIMARY booking ${primaryBookingId} for group`);
          }
        } catch (e) {
          console.error(`[Webhook] Failed to confirm primary booking ${primaryBookingId}`, e);
        }
      }

      // 2. Clean up Secondary Reserved Bookings (Merge Rule)
      // Since we merged all participants into Primary, these other reservations are now duplicates
      if (confirmed && secondaryBookingIds.length > 0) {
        console.log(
          `[Webhook] Cleaning up ${secondaryBookingIds.length} redundant bookings merged into ${primaryBookingId}`,
        );

        for (const id of secondaryBookingIds) {
          await deleteBooking(id);
        }
      }

      // --- GOOGLE CALENDAR SYNC START ---
      // We only sync if we have a confirmed booking (either primary or new)
      const bookingIdToSync = confirmed ? primaryBookingId : null; // If we create new below, we'll sync that too.

      let calendarDescription = "";
      if (participants.length === 1) {
        const p = participants[0];
        const isAdult = p.type === "adult";
        const studentName = p.name;
        const phone = isAdult ? p.phoneNumber : p.primaryContactPhone;
        const email = isAdult ? p.email : p.primaryContactEmail;

        calendarDescription = `Student: ${studentName}\nType: ${p.type}\nNotes: ${p.additionalComments || "None"}\nPhone: ${phone || "N/A"}\nEmail: ${email || "N/A"}`;

        if (p.phoneType) calendarDescription += `\nPhone Type: ${p.phoneType}`;
        if (p.preferredContactMethod) calendarDescription += `\nContact Method: ${p.preferredContactMethod}`;
        if (p.hasOwnClubs !== undefined) calendarDescription += `\nHas Clubs: ${p.hasOwnClubs ? "Yes" : "No"}`;
      } else {
        calendarDescription = `Type: group\nNotes: Multiple participants checkout\n\nParticipants:\n`;
        participants.forEach((p, i) => {
          const isAdult = p.type === "adult";
          if (isAdult) {
            calendarDescription += `${i + 1}. ${p.name} — ${p.email || "N/A"}, ${p.phoneNumber || "N/A"}\n`;
          } else {
            calendarDescription += `${i + 1}. ${p.childFirstName} ${p.childLastName} (Parent: ${p.primaryContactFirstName} ${p.primaryContactLastName})\n`;
          }
        });
      }

      // 3. Fallback: Create New Booking if no valid reservation found (or failed)
      if (!confirmed) {
        // ... (Use existing fallback logic but for the GROUP)
        const startDate = fromZonedTime(
          `${slot.date} ${slot.startTime}`,
          "America/New_York",
        );
        const endDate = fromZonedTime(
          `${slot.date} ${slot.endTime}`,
          "America/New_York",
        );

        // Use first participant for user linking logic (imperfect but functional for guest checkout)
        const firstP = participants[0];
        const existingUser = await getRegularUserByEmail(firstP.email);

        if (existingUser) {
          const isAvailable = await checkTimeSlotAvailability(
            startDate,
            endDate,
          );
          const status = isAvailable ? "confirmed" : "conflict";

          const notes = [
            `Private Lesson Group (${participants.length} participants)`,
            ...participants.map((p) => `- ${p.name} (${p.type})`),
            !isAvailable ? "[CONFLICT - REFUND NEEDED]" : null,
          ].filter(Boolean)
            .join("\n");

          // Create title with names
          const firstPType = firstP.type === "adult" ? "Adult" : "Junior";
          const title = `${firstPType} Lesson (${participants.length} participant${participants.length === 1 ? "" : "s"})`;

          // We need to pass valid participant objects for `createBooking`.
          // `createBooking` now expects objects that match the schema for `adultRegistration` or `juniorRegistration`.
          // We have a `type` property in `participants`.
          // We must ensure the `participants` array contains objects with correct properties.


          const newBooking = await createBooking(
            {
              title: title,
              userId: existingUser.id,
              startTime: startDate,
              endTime: endDate,
              type: firstP.type, // broadly categorize
              status: status,
              notes: notes,
            },
            participants,
          );

          if (status === "confirmed") {
            await syncBookingToGoogleCalendar(newBooking.id, title, startDate, endDate, calendarDescription);
          }
        }
      } else if (bookingIdToSync) {
        // Sync the confirmed primary booking
        // We need to fetch it to get timestamps or rely on slot data
        // Re-calculating dates from slot to be safe/consistent
        const startDate = fromZonedTime(`${slot.date} ${slot.startTime}`, "America/New_York");
        const endDate = fromZonedTime(`${slot.date} ${slot.endTime}`, "America/New_York");

        const firstPType = participants[0].type === "adult" ? "Adult" : "Junior";
        const title = `${firstPType} Lesson (${participants.length} participant${participants.length === 1 ? "" : "s"})`;

        // Update Title in DB too? Yes, ideally.
        // But for now let's just sync to Calendar.
        await syncBookingToGoogleCalendar(bookingIdToSync, title, startDate, endDate, calendarDescription);
      }
      // --- GOOGLE CALENDAR SYNC END ---

    } catch (e) {
      console.error(`[Webhook] Error processing booking group ${key}`, e);
    }
  }


  // ------------------------------------------------
  // RESUME ORIGINAL LOOP (Group Sessions Only)
  // ------------------------------------------------

  // Reset indices for loop consumption? No, we need to be careful.
  // The original code looped through `formData.items`.
  // We split the loop.
  // Now we need to handle "CASE 2: Group Session" which was in the original loop.
  // So we should have a SECOND loop for Group items, relying on the collected indices?
  // Actually, simpler:
  // Let's just Loop again for Group Items, and manage the `groupRegistrationIndex`.

  groupRegistrationIndex = 0; // Reset or maintain?
  // The original loop used one index variable. We should just restart a fresh loop for Group items.

  for (const [index, item] of formData.items.entries()) {
    try {
      const itemWithMetadata = item as typeof item & { metadata?: string };
      const isPrivate = !!itemWithMetadata.metadata;
      const isGroup = !isPrivate && !!item.programId;

      // ---------------------------------------------------
      // CASE 2: Group Session (Confirm OR Create Registration)
      // ---------------------------------------------------
      if (isGroup) {
        // Since we don't have pre-created holds (groupRegistrationIds is always empty),
        // we always create the registration freshly here.
        let paymentStatus: "paid" | "failed" = "paid";
        let additionalComments = "";

        // FINAL CAPACITY CHECK (Anti-Overbooking)
        if (item.programSessionId) {
          try {
            const capacityCheck = await checkProgramSessionCapacity(
              item.programSessionId,
            );
            if (!capacityCheck.available) {
              console.error(
                `[Webhook] OVERBOOKING DETECTED for session ${item.programSessionId}. Marking as FAILED.`,
              );
              paymentStatus = "failed";
              additionalComments =
                "\n[SYSTEM: OVERBOOKED - REFUND NEEDED] Session was full at moment of payment processing.";
            }
          } catch (err) {
            console.error(
              `[Webhook] Error checking capacity for session ${item.programSessionId}`,
              err,
            );
          }
        }

        if (item.registrationType === "adult") {
          const formData = item.formData as any;
          if (additionalComments) {
            formData.additionalComments =
              (formData.additionalComments || "") + additionalComments;
          }

          await createAdultRegistrationFromCheckout(
            item,
            paymentIntent.id,
            paymentIntent.customer as string | undefined,
            pricePerItem,
            paymentStatus,
          );
        } else if (item.registrationType === "junior") {
          const formData = item.formData as any;
          if (additionalComments) {
            formData.additionalComments =
              (formData.additionalComments || "") + additionalComments;
          }

          await createJuniorRegistrationFromCheckout(
            item,
            paymentIntent.id,
            paymentIntent.customer as string | undefined,
            pricePerItem,
            paymentStatus,
          );
        }
      }
      // isPrivate items are handled in the first loop of handleCartCheckoutSuccess
    } catch (error) {
      console.error(
        `[Webhook] Error processing item ${index} (${item.cartItemId}):`,
        error,
      );
      // Continue processing other items even if one fails
    }
  }

  // Mark checkout session as completed
  await completeCheckoutSession(checkoutId);

  // Delete the cart
  try {
    await deleteCart(cartId);
    console.log(`Cart ${cartId} deleted after successful checkout`);
  } catch (error) {
    console.error(`Error deleting cart ${cartId}:`, error);
  }

  // Send confirmation email
  try {
    // Get primary email from first item
    const firstItem = formData.items[0];
    const recipientEmail =
      firstItem.registrationType === "adult"
        ? (firstItem.formData as any).email
        : (firstItem.formData as any).primaryContactEmail;

    console.log(
      `[Webhook] Attempting to send confirmation email to: ${recipientEmail} for ${formData.items.length} items`,
    );

    if (recipientEmail) {
      // Build email items with program names
      const emailItems = await Promise.all(
        formData.items.map(async (item: any) => {
          // Fetch program details
          const program = await getProgramById(item.programId);
          const programName = program ? program.name : "Golf Program";

          let sessionInfo = undefined;
          let startDate = undefined;
          let sessionDates: { date: string; time: string }[] = [];

          // Parse metadata for session info if private
          if (item.metadata) {
            try {
              const meta = JSON.parse(item.metadata);
              if (meta.slots && meta.slots.length > 0) {
                // Private lesson slots
                startDate = new Date(meta.slots[0].date);

                sessionDates = meta.slots.map((s: any) => {
                  const date = new Date(s.date);
                  return {
                    date: date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }),
                    time: formatTime12h(s.startTime),
                  };
                });

                // Also build flat sessionInfo for plain text fallback
                sessionInfo = sessionDates
                  .map((sd) => `${sd.date} at ${sd.time}`)
                  .join("; ");
              } else if (meta.date) {
                // Legacy single slot
                const date = new Date(meta.date);
                startDate = date;
                const formattedDate = date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });
                sessionDates = [{ date: formattedDate, time: formatTime12h(meta.startTime) }];
                sessionInfo = `${formattedDate} at ${formatTime12h(meta.startTime)}`;
              }
            } catch (e) {
              console.error("Error parsing metadata for email:", e);
            }
          } else if (item.programSessionId) {
            // Group session
            try {
              const session = await getProgramSessionById(
                item.programSessionId,
              );
              if (session && session.schedule) {
                const schedule =
                  typeof session.schedule === "string"
                    ? JSON.parse(session.schedule)
                    : session.schedule;

                if (Array.isArray(schedule) && schedule.length > 0) {
                  const firstDate = new Date(schedule[0].date);
                  startDate = firstDate;

                  const formattedDate = firstDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });
                  sessionDates = [
                    { date: formattedDate, time: formatTime12h(schedule[0].startTime) },
                  ];
                  sessionInfo = `${formattedDate} at ${formatTime12h(schedule[0].startTime)}`;
                }
              } else if (session) {
                sessionInfo = session.name;
                if (session.startDate) {
                  startDate = new Date(session.startDate);
                }
              }
            } catch (e) {
              console.error("Error fetching session for email:", e);
            }
          }

          return {
            programName,
            registrationType: item.registrationType,
            formData: item.formData as any,
            sessionInfo,
            sessionDates: sessionDates.length > 0 ? sessionDates : undefined,
            price: pricePerItem,
            startDate,
          };
        }),
      );

      const emailResult = await sendRegistrationConfirmationEmail({
        to: recipientEmail,
        items: emailItems,
        totalAmount: paymentAmount,
        paymentId: paymentIntent.id,
      });

      if (!emailResult.success) {
        console.error(
          `[Webhook] Failed to send confirmation email: ${emailResult.error}`,
        );
      } else {
        console.log(`[Webhook] Confirmation email sent successfully to ${recipientEmail}`);
      }
    } else {
      console.warn("No recipient email found for confirmation email");
    }
  } catch (emailError) {
    // Don't fail the webhook if email fails
    console.error("Failed to send confirmation email:", emailError);
  }

  console.log(`Cart checkout ${checkoutId} completed successfully`);
}

/**
 * Create adult registration from checkout data
 */
async function createAdultRegistrationFromCheckout(
  item: {
    programId: string;
    programSessionId?: string;
    formData: Record<string, unknown>;
  },
  paymentIntentId: string,
  stripeCustomerId: string | undefined,
  paymentAmount: string,
  paymentStatus: "paid" | "failed" = "paid",
) {
  const formData = item.formData as {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    additionalComments?: string;
  };

  if (!formData) {
    console.error("[Webhook] Missing formData for adult registration item");
    throw new Error("Missing formData for adult registration item");
  }

  // Get or create user
  const user = await getOrCreateRegularUser({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
  });

  // Create registration with paid status
  const registration = await createAdultRegistration({
    userId: user.id,
    programId: item.programId,
    programSessionId: item.programSessionId,
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
    additionalComments: formData.additionalComments,
    stripePaymentIntentId: paymentIntentId,
    stripeCustomerId: stripeCustomerId,
    paymentStatus: paymentStatus,
    paymentAmount: paymentAmount,
  });

  return registration;
}

/**
 * Create junior registration from checkout data
 */
async function createJuniorRegistrationFromCheckout(
  item: {
    programId: string;
    programSessionId?: string;
    formData: Record<string, unknown>;
  },
  paymentIntentId: string,
  stripeCustomerId: string | undefined,
  paymentAmount: string,
  paymentStatus: "paid" | "failed" = "paid",
) {
  const formData = item.formData as {
    primaryContactFirstName: string;
    primaryContactLastName: string;
    primaryContactEmail: string;
    primaryContactPhone: string;
    phoneType: "mobile" | "home" | "work";
    preferredContactMethod: "text" | "email";
    childFirstName: string;
    childLastName: string;
    childAge: number;
    childExperienceLevel: string;
    hasOwnClubs: boolean;
    friendsToGroupWith?: string;
    additionalComments?: string;
  };

  // Get or create parent user
  const user = await getOrCreateRegularUser({
    firstName: formData.primaryContactFirstName,
    lastName: formData.primaryContactLastName,
    email: formData.primaryContactEmail,
    phoneNumber: formData.primaryContactPhone,
  });

  // Create junior registration
  const juniorReg = await createJuniorRegistration({
    userId: user.id,
    primaryContactFirstName: formData.primaryContactFirstName,
    primaryContactLastName: formData.primaryContactLastName,
    primaryContactEmail: formData.primaryContactEmail,
    primaryContactPhone: formData.primaryContactPhone,
    phoneType: formData.phoneType,
    preferredContactMethod: formData.preferredContactMethod,
    childFirstName: formData.childFirstName,
    childLastName: formData.childLastName,
    childAge: formData.childAge,
    childExperienceLevel: formData.childExperienceLevel,
    hasOwnClubs: formData.hasOwnClubs,
    friendsToGroupWith: formData.friendsToGroupWith,
    additionalComments: formData.additionalComments,
  });

  // Link to program with payment details
  const programReg = await createJuniorProgramRegistration({
    juniorRegistrationId: juniorReg.id,
    programId: item.programId,
    programSessionId: item.programSessionId,
    stripePaymentIntentId: paymentIntentId,
    stripeCustomerId: stripeCustomerId,
    paymentStatus: paymentStatus,
    paymentAmount: paymentAmount,
  });

  return { juniorReg, programReg };
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log("Payment failed:", paymentIntent.id);

  const metadata = paymentIntent.metadata;

  // For cart checkout, we don't create registrations on failure
  // The checkout session will eventually expire
  if (metadata.type === "cart_checkout") {
    console.log(`Cart checkout ${metadata.checkoutId} payment failed`);
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentIntentCanceled(paymentIntent: any) {
  console.log("Payment canceled:", paymentIntent.id);

  const metadata = paymentIntent.metadata;

  // For cart checkout, we don't create registrations on cancel
  if (metadata.type === "cart_checkout") {
    console.log(`Cart checkout ${metadata.checkoutId} payment canceled`);
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(session: any) {
  console.log("Checkout session completed:", session.id);

  // Extract metadata
  const metadata = session.metadata;

  if (metadata && metadata.type === "cart_checkout") {
    // This is a cart checkout
    const checkoutId = metadata.checkoutId;
    const paymentIntentId = session.payment_intent as string;

    // Update local session with PI if available
    if (checkoutId && paymentIntentId) {
      await updateCheckoutSessionPaymentIntent(checkoutId, paymentIntentId);
    }

    // Create compatible object for existing handler
    // If payment_intent is string, we might need more data if handleCartCheckoutSuccess uses it deep
    // handleCartCheckoutSuccess uses: paymentIntent.id, paymentIntent.metadata, paymentIntent.amount, paymentIntent.customer

    const paymentIntentCompatible = {
      id: paymentIntentId || session.id,
      amount: session.amount_total,
      metadata: metadata,
      customer: session.customer,
    };

    // ... existing code ...

    await handleCartCheckoutSuccess(paymentIntentCompatible);
  }
}

/**
 * Helper to sync booking to Google Calendar
 */
import { createEvent } from "@/lib/google-calendar";
import { db } from "@/db"; // Ensure DB import availability
import { googleCalendarIntegration } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateBooking } from "@/db/queries/bookings";

async function syncBookingToGoogleCalendar(
  bookingId: string,
  title: string,
  startDate: Date,
  endDate: Date,
  description: string
) {
  try {
    // 1. Get Integration
    const integration = await db.query.googleCalendarIntegration.findFirst({
      where: eq(googleCalendarIntegration.isActive, true),
    });

    if (!integration || !integration.calendarId) {
      console.log("[Webhook] No active Google Calendar integration found. Skipping sync.");
      return;
    }

    // 2. Create Event
    console.log(`[Webhook] Syncing booking ${bookingId} to Google Calendar...`);

    // We need to refresh token? createEvent helper might fail if expired and no refresh logic inside.
    // The lib/google-calendar.ts I copied has simple `createCalendarClient` that just uses the token.
    // It does NOT auto-refresh. We should ideally check/refresh.
    // For now, let's assume the token is valid or strict failure is acceptable until we add robust refresh.
    // Actually, `createEvent` in the lib I copied DOES NOT refresh. 
    // BUT `createCalendarClient` takes refreshToken. Does googleapis auto-refresh? 
    // Yes, `google.auth.OAuth2` handles refresh IF refresh_token is set.

    const event = await createEvent(
      integration.accessToken,
      integration.refreshToken || undefined,
      integration.calendarId,
      {
        summary: title,
        description: description,
        start: { dateTime: startDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
      }
    );

    if (event.id) {
      console.log(`[Webhook] Created Google Calendar event: ${event.id}`);
      // Save event.id and calendarId to booking for later management (e.g. cancellation)
      await updateBooking(bookingId, {
        googleCalendarEventId: event.id,
        googleCalendarId: integration.calendarId
      });
    }

  } catch (error) {
    console.error(`[Webhook] Failed to sync booking ${bookingId} to Google Calendar:`, error);
  }
}
