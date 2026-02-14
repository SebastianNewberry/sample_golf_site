import { headers } from "next/headers";
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { sendRegistrationConfirmationEmail } from "@/lib/email";
import {
  updateAdultRegistrationPaymentStatus,
  getAdultRegistrationByPaymentIntentId,
  createAdultRegistration,
} from "@/db/queries/adult-registrations";
import {
  updateJuniorProgramRegistrationPaymentStatus,
  getJuniorProgramRegistrationByPaymentIntentId,
  createJuniorRegistration,
  createJuniorProgramRegistration,
} from "@/db/queries/junior-registrations";
import { getOrCreateRegularUser } from "@/db/queries/users";
import {
  getCheckoutSessionByPaymentIntentId,
  getCheckoutSessionByCheckoutId,
  completeCheckoutSession,
  updateCheckoutSessionPaymentIntent,
} from "@/db/queries/checkout-sessions";
import { deleteCart } from "@/db/queries/cart";
import { getRegularUserByEmail } from "@/db/queries/users";
import {
  createBooking,
  checkTimeSlotAvailability,
  updateBookingStatus,
  addBookingParticipants,
  getBookingById,
} from "@/db/queries/bookings";
import { checkProgramSessionCapacity } from "@/db/queries/programs";

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
 * Creates registrations for cart checkouts or updates existing registrations
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log(
    `[Webhook] Payment succeeded: ${paymentIntent.id}. Metadata:`,
    JSON.stringify(paymentIntent.metadata),
  );

  const metadata = paymentIntent.metadata;

  // Handle cart checkout (new flow)
  if (metadata.type === "cart_checkout") {
    await handleCartCheckoutSuccess(paymentIntent);
    return;
  }

  // Handle legacy adult registration
  if (metadata.type === "adult_registration") {
    await handleLegacyAdultRegistration(paymentIntent);
    return;
  }

  // Handle legacy junior registration
  if (metadata.type === "junior_registration") {
    await handleLegacyJuniorRegistration(paymentIntent);
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

        // 2. Private Instruction Bookings
        try {
          const slotData = JSON.parse(itemWithMetadata.metadata as string);
          const slots = slotData.slots || (slotData.date ? [slotData] : []);

          if (slots.length > 0) {
            console.log(
              `[Webhook] Processing ${slots.length} bookings/slots for item ${item.cartItemId}`,
            );

            let userEmail = "";
            let studentName = "";
            let bookingType = item.registrationType;
            let title = "";

            if (item.registrationType === "adult") {
              const adultData = item.formData as any;
              userEmail = adultData.email;
              studentName = `${adultData.firstName} ${adultData.lastName}`;
              title = `Private Lesson - ${studentName}`;
            } else {
              const juniorData = item.formData as any;
              userEmail = juniorData.primaryContactEmail;
              studentName = `${juniorData.childFirstName} ${juniorData.childLastName}`;
              title = `Junior Lesson - ${studentName}`;
            }

            const existingUser = await getRegularUserByEmail(userEmail);

            if (existingUser) {
              const participantData = {
                name: studentName,
                email: userEmail,
                type: bookingType,
                ...(bookingType === "junior"
                  ? {
                      parentName: `${(item.formData as any).primaryContactFirstName} ${(item.formData as any).primaryContactLastName}`,
                      parentEmail: (item.formData as any).primaryContactEmail,
                      parentPhone: (item.formData as any).primaryContactPhone,
                      childAge: (item.formData as any).childAge,
                      childExperience: (item.formData as any)
                        .childExperienceLevel,
                    }
                  : {}),
              };

              for (const slot of slots) {
                // Consume reserved ID
                const reservedBookingId =
                  reservationBookingIds[reservationBookingIndex];
                reservationBookingIndex++;

                let confirmedReservation = false;

                if (reservedBookingId) {
                  try {
                    const booking = await getBookingById(reservedBookingId);
                    if (booking && booking.status === "pending_payment") {
                      // Construct detailed notes
                      const detailNotes = [
                        `Student: ${studentName}`,
                        `Type: ${bookingType === "adult" ? "Adult" : "Junior"} Private Lesson`,
                        `Contact: ${userEmail}`,
                        bookingType === "junior"
                          ? `Parent: ${(item.formData as any).primaryContactFirstName} ${(item.formData as any).primaryContactLastName}`
                          : null,
                        (item.formData as any).additionalComments
                          ? `Comments: ${(item.formData as any).additionalComments}`
                          : null,
                        `Program ID: ${item.programId}`,
                      ]
                        .filter(Boolean)
                        .join("\n");

                      // Confirm Booking
                      await updateBookingStatus(
                        reservedBookingId,
                        "confirmed",
                        {
                          notes: detailNotes,
                        },
                      );
                      await addBookingParticipants(reservedBookingId, [
                        participantData,
                      ]);
                      confirmedReservation = true;
                      console.log(
                        `[Webhook] Confirmed reservation ${reservedBookingId}`,
                      );
                    }
                  } catch (e) {
                    console.error(
                      `[Webhook] Failed to confirm reservation ${reservedBookingId}`,
                      e,
                    );
                  }
                }

                if (!confirmedReservation) {
                  // Fallback creation
                  const baseDate = new Date(slot.date);
                  const [startH, startM] = slot.startTime
                    .split(":")
                    .map(Number);
                  const [endH, endM] = slot.endTime.split(":").map(Number);

                  const startDate = new Date(baseDate);
                  startDate.setHours(startH, startM, 0, 0);

                  const endDate = new Date(baseDate);
                  endDate.setHours(endH, endM, 0, 0);

                  const isAvailable = await checkTimeSlotAvailability(
                    startDate,
                    endDate,
                  );
                  const status = isAvailable ? "confirmed" : "conflict";

                  if (!isAvailable) {
                    console.error(
                      `[Webhook] DOUBLE BOOKING DETECTED for ${studentName} at ${startDate.toISOString()}. Marking as CONFLICT.`,
                    );
                  }

                  // Construct detailed notes for fallback
                  const detailNotes = [
                    `Student: ${studentName}`,
                    `Type: ${bookingType === "adult" ? "Adult" : "Junior"} Private Lesson`,
                    `Contact: ${userEmail}`,
                    bookingType === "junior"
                      ? `Parent: ${(item.formData as any).primaryContactFirstName} ${(item.formData as any).primaryContactLastName}`
                      : null,
                    (item.formData as any).additionalComments
                      ? `Comments: ${(item.formData as any).additionalComments}`
                      : null,
                    `Program ID: ${item.programId}`,
                    !isAvailable
                      ? "[CONFLICT - REFUND NEEDED] Slot taken during checkout."
                      : null,
                  ]
                    .filter(Boolean)
                    .join("\n");

                  await createBooking(
                    {
                      title,
                      userId: existingUser.id,
                      startTime: startDate,
                      endTime: endDate,
                      type: bookingType,
                      status: status,
                      notes: detailNotes,
                    },
                    [participantData],
                  );
                }
              }
            }
          }
        } catch (e) {
          console.error(
            `[Webhook] Failed to process Private bookings for item ${item.cartItemId}`,
            e,
          );
        }
      }

      // ---------------------------------------------------
      // CASE 2: Group Session (Confirm OR Create Registration)
      // ---------------------------------------------------
      else if (isGroup) {
        const reservedRegId = groupRegistrationIds[groupRegistrationIndex];
        groupRegistrationIndex++;

        let confirmedGroupHold = false;

        if (reservedRegId) {
          try {
            if (item.registrationType === "adult") {
              // Confirm Adult Registration
              await updateAdultRegistrationPaymentStatus(reservedRegId, {
                stripePaymentIntentId: paymentIntent.id,
                stripeCustomerId: paymentIntent.customer as string | undefined,
                paymentStatus: "paid",
                paymentAmount: pricePerItem,
                // Queries check: status='paid' OR (...)
              });
            } else {
              // Confirm Junior Program Registration
              await updateJuniorProgramRegistrationPaymentStatus(
                reservedRegId,
                {
                  stripePaymentIntentId: paymentIntent.id,
                  stripeCustomerId: paymentIntent.customer as
                    | string
                    | undefined,
                  paymentStatus: "paid",
                  paymentAmount: pricePerItem,
                },
              );
            }
            confirmedGroupHold = true;
            console.log(
              `[Webhook] Confirmed group registration ${reservedRegId}`,
            );
          } catch (e) {
            console.error(
              `[Webhook] Failed to confirm group hold ${reservedRegId}`,
              e,
            );
          }
        }

        if (!confirmedGroupHold) {
          // Fallback: Create Fresh
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
              // Fail-Open: Allow registration if capacity check fails to avoid data loss
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
      } else {
        // Fallback for weird items (shouldn't happen, but treat as standard checkout creation)
        if (item.registrationType === "adult") {
          await createAdultRegistrationFromCheckout(
            item,
            paymentIntent.id,
            paymentIntent.customer as string,
            pricePerItem,
          );
        } else {
          await createJuniorRegistrationFromCheckout(
            item,
            paymentIntent.id,
            paymentIntent.customer as string,
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

    if (recipientEmail) {
      // Build email items with program names (we need to fetch these)
      const emailItems = formData.items.map((item, idx) => ({
        programName: `Golf Program`, // Default name
        registrationType: item.registrationType,
        formData: item.formData as any,
        sessionInfo: undefined,
        price: pricePerItem,
      }));

      await sendRegistrationConfirmationEmail({
        to: recipientEmail,
        items: emailItems,
        totalAmount: paymentAmount,
        paymentId: paymentIntent.id,
      });
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
 * Handle legacy adult registration (direct checkout without cart)
 */
async function handleLegacyAdultRegistration(paymentIntent: any) {
  const registration = await getAdultRegistrationByPaymentIntentId(
    paymentIntent.id,
  );

  if (registration) {
    await updateAdultRegistrationPaymentStatus(registration.id, {
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: paymentIntent.customer as string | undefined,
      paymentStatus: "paid",
      paymentAmount: (paymentIntent.amount / 100).toFixed(2),
    });
    console.log(`Adult registration ${registration.id} marked as paid`);
  } else {
    console.warn(
      `No adult registration found for payment intent ${paymentIntent.id}`,
    );
  }
}

/**
 * Handle legacy junior registration (direct checkout without cart)
 */
async function handleLegacyJuniorRegistration(paymentIntent: any) {
  const registration = await getJuniorProgramRegistrationByPaymentIntentId(
    paymentIntent.id,
  );

  if (registration) {
    await updateJuniorProgramRegistrationPaymentStatus(registration.id, {
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: paymentIntent.customer as string | undefined,
      paymentStatus: "paid",
      paymentAmount: (paymentIntent.amount / 100).toFixed(2),
    });
    console.log(
      `Junior program registration ${registration.id} marked as paid`,
    );
  } else {
    console.error(
      `No junior program registration found for payment intent ${paymentIntent.id}`,
    );
  }
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
    return;
  }

  // Handle legacy flows
  if (metadata.type === "adult_registration") {
    const registration = await getAdultRegistrationByPaymentIntentId(
      paymentIntent.id,
    );
    if (registration) {
      await updateAdultRegistrationPaymentStatus(registration.id, {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "failed",
      });
    }
  } else if (metadata.type === "junior_registration") {
    const registration = await getJuniorProgramRegistrationByPaymentIntentId(
      paymentIntent.id,
    );
    if (registration) {
      await updateJuniorProgramRegistrationPaymentStatus(registration.id, {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "failed",
      });
    }
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
    return;
  }

  // Handle legacy flows
  if (metadata.type === "adult_registration") {
    const registration = await getAdultRegistrationByPaymentIntentId(
      paymentIntent.id,
    );
    if (registration) {
      await updateAdultRegistrationPaymentStatus(registration.id, {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "cancelled",
      });
    }
  } else if (metadata.type === "junior_registration") {
    const registration = await getJuniorProgramRegistrationByPaymentIntentId(
      paymentIntent.id,
    );
    if (registration) {
      await updateJuniorProgramRegistrationPaymentStatus(registration.id, {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "cancelled",
      });
    }
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

    await handleCartCheckoutSuccess(paymentIntentCompatible);
  }
}

export const runtime = "nodejs";
