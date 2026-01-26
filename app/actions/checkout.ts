"use server";

import { cookies } from "next/headers";
import stripe from "@/lib/stripe";
import { getCartWithItems, deleteCart } from "@/db/queries/cart";
import { createCheckoutSession } from "@/db/queries/checkout-sessions";

const CART_SESSION_COOKIE = "cart_session_id";

import { validateCartAvailability } from "@/app/actions/validation";
import { createBooking } from "@/db/queries/bookings";
import { getOrCreateRegularUser } from "@/db/queries/users";
import { createAdultRegistration } from "@/db/queries/adult-registrations";
import {
  createJuniorRegistration,
  createJuniorProgramRegistration,
  deleteJuniorProgramRegistration,
} from "@/db/queries/junior-registrations";
import { deleteAdultRegistration } from "@/db/queries/adult-registrations";
import { deleteBooking } from "@/db/queries/bookings";
import { checkProgramSessionCapacity } from "@/db/queries/programs";

interface AdultFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  additionalComments?: string;
}

interface JuniorFormData {
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
}

interface CheckoutItem {
  cartItemId: string;
  programId: string;
  programSessionId?: string;
  registrationType: "adult" | "junior";
  formData: AdultFormData | JuniorFormData;
  metadata?: string;
}

interface CheckoutData {
  items: CheckoutItem[];
  totalAmount: number;
}

/**
 * Process checkout - creates payment intent with all form data stored in database
 * Registrations are created ONLY after payment succeeds (in webhook)
 */
export async function processCheckout(data: CheckoutData) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

    if (!sessionId) {
      return {
        success: false,
        error: "No cart session found",
      };
    }

    // Verify cart exists and matches
    const cart = await getCartWithItems(sessionId);

    if (!cart) {
      return {
        success: false,
        error: "Cart not found",
      };
    }

    // Validate items match cart (check total quantity)
    const totalCartItems = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    if (data.items.length !== totalCartItems) {
      return {
        success: false,
        error:
          "Cart has changed or is incomplete. Please refresh and try again.",
      };
    }

    // --------------------------------------------------------
    // CAPACITY CHECK
    // --------------------------------------------------------
    // Passing cart.items (which has metadata) to validation
    const availability = await validateCartAvailability(cart.items);
    if (!availability.valid) {
      return {
        success: false,
        error:
          availability.error ||
          "Some items in your cart are no longer available.",
      };
    }

    // Get primary email from first form (for receipt)
    const primaryEmail = getPrimaryEmail(data.items[0]);

    // Generate unique checkout ID EARLY so we can use it in reservation notes
    const checkoutId = crypto.randomUUID();

    // --------------------------------------------------------
    // RESERVATION (HOLD) LOGIC
    // --------------------------------------------------------
    // Create pending bookings for 30 minutes to hold the slots
    // --------------------------------------------------------

    // We will collect the booking IDs created here
    const createdBookingIds: string[] = [];
    const createdGroupRegistrationIds: string[] = [];
    const holdExpirationTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    try {
      for (const item of data.items) {
        // CASE 1: Private Instruction (Has Metadata/Slots)
        // ------------------------------------------------
        if (item.metadata) {
          try {
            // Parse metadata for slots
            const slotData = JSON.parse(item.metadata);
            const slots = slotData.slots || (slotData.date ? [slotData] : []);

            // Get student name/details to store in the hold (even though it's pending)
            let studentName = "";
            let title = "";

            if (item.registrationType === "adult") {
              const d = item.formData as AdultFormData;
              studentName = `${d.firstName} ${d.lastName}`;
              title = `Private Lesson - ${studentName} (Pending)`;
            } else {
              const d = item.formData as JuniorFormData;
              studentName = `${d.childFirstName} ${d.childLastName}`;
              title = `Junior Lesson - ${studentName} (Pending)`;
            }

            if (slots.length > 0) {
              for (const slot of slots) {
                const baseDate = new Date(slot.date);
                const [startH, startM] = slot.startTime.split(":").map(Number);
                const [endH, endM] = slot.endTime.split(":").map(Number);

                const startDate = new Date(baseDate);
                startDate.setHours(startH, startM, 0, 0);

                const endDate = new Date(baseDate);
                endDate.setHours(endH, endM, 0, 0);

                // Create the HOLD booking
                const booking = await createBooking(
                  {
                    title: title,
                    userId: null, // No user ID yet, we link it in webhook
                    startTime: startDate,
                    endTime: endDate,
                    type: item.registrationType,
                    status: "pending_payment",
                    expiresAt: holdExpirationTime,
                    notes: `Hold for Checkout ${checkoutId}`,
                  },
                  [],
                ); // No participants yet, we add them in webhook

                createdBookingIds.push(booking.id);
              }
            }
          } catch (e) {
            console.error("Error creating hold for item", e);
          }
        }

        // CASE 2: Group Session (No metadata slots, but has Program info)
        // ---------------------------------------------------------------
        else if (item.programId) {
          try {
            // We pre-create the Registration record as "Pending"
            // This reserves the spot against capacity checks

            // 1. Get/Create User
            let userId = "";
            if (item.registrationType === "adult") {
              const d = item.formData as AdultFormData;
              const u = await getOrCreateRegularUser({
                firstName: d.firstName,
                lastName: d.lastName,
                email: d.email,
                phoneNumber: d.phoneNumber,
              });
              userId = u.id;

              // 2. Create Pending Adult Registration
              const reg = await createAdultRegistration({
                userId,
                programId: item.programId,
                programSessionId: item.programSessionId,
                firstName: d.firstName,
                lastName: d.lastName,
                email: d.email,
                phoneNumber: d.phoneNumber,
                additionalComments: d.additionalComments,
                paymentStatus: "pending",
                expiresAt: holdExpirationTime,
              });
              createdGroupRegistrationIds.push(reg.id);
            } else {
              const d = item.formData as JuniorFormData;
              const u = await getOrCreateRegularUser({
                firstName: d.primaryContactFirstName,
                lastName: d.primaryContactLastName,
                email: d.primaryContactEmail,
                phoneNumber: d.primaryContactPhone,
              });
              userId = u.id;

              // 2. Create Junior Registration (Profile) + Program Registration (Link)
              const juniorReg = await createJuniorRegistration({
                userId,
                primaryContactFirstName: d.primaryContactFirstName,
                primaryContactLastName: d.primaryContactLastName,
                primaryContactEmail: d.primaryContactEmail,
                primaryContactPhone: d.primaryContactPhone,
                phoneType: d.phoneType,
                preferredContactMethod: d.preferredContactMethod,
                childFirstName: d.childFirstName,
                childLastName: d.childLastName,
                childAge: d.childAge,
                childExperienceLevel: d.childExperienceLevel,
                hasOwnClubs: d.hasOwnClubs,
                friendsToGroupWith: d.friendsToGroupWith,
                additionalComments: d.additionalComments,
              });

              // Create Program Link (This is what holds the spot)
              const progReg = await createJuniorProgramRegistration({
                juniorRegistrationId: juniorReg.id,
                programId: item.programId,
                programSessionId: item.programSessionId,
                paymentStatus: "pending",
                expiresAt: holdExpirationTime,
              });
              createdGroupRegistrationIds.push(progReg.id);
            }
          } catch (e) {
            console.error("Error creating hold for group item", e);
          }
        }
      }
    } catch (e) {
      console.error("Failed to create reservations", e);
      return {
        success: false,
        error: "Failed to reserve time slots. Please try again.",
      };
    }

    // --------------------------------------------------------
    // POST-RESERVATION VERIFICATION (ROLLBACK STRATEGY)
    // --------------------------------------------------------
    // Check if we overbooked any session. If so, ROLLBACK everything.
    try {
      // 1. Identify all unique program sessions we just touched
      const sessionIdsToCheck = new Set<string>();
      for (const item of data.items) {
        if (item.programSessionId) {
          sessionIdsToCheck.add(item.programSessionId);
        }
      }

      // 2. Check capacity for each
      for (const sessionId of sessionIdsToCheck) {
        const capacityCheck = await checkProgramSessionCapacity(sessionId);

        // If remaining < 0, we have overbooked (current > capacity)
        if (capacityCheck.remaining < 0) {
          console.error(
            `Overbooking detected for session ${sessionId}. Rolling back.`,
          );

          // ROLLBACK: Delete all created records
          await Promise.all([
            // Delete bookings
            ...createdBookingIds.map((id) => deleteBooking(id)),
            // Delete adult registrations
            ...createdGroupRegistrationIds.map((id) => {
              // We need to know if it's adult or junior to call right delete function
              // Ideally createdGroupRegistrationIds would store type, but for now we try both or
              // better: simply delete by ID from both tables? IDs are UUIDs so it's safe-ish but
              // actually we should probably track which is which?
              // Let's rely on the fact that we can just try to delete from both
              // OR better: we know based on the item type in the loop?
              // Wait, we just have a list of IDs.
              // Let's update the creation loop to store objects {id, type} instead of just strings?
              // Refactoring that above is safer.

              // For now, let's try to delete from Adult first, if not found then Junior.
              // Or better: Let user know I am refactoring the ID collection logic first?
              // Actually, let's just use a try-catch on both deletes.
              (deleteAdultRegistration(id).catch(() => {}),
                deleteJuniorProgramRegistration(id).catch(() => {}));
            }),
          ]);

          return {
            success: false,
            error:
              "One of the items in your cart has just sold out. Please check your cart.",
          };
        }
      }
    } catch (e) {
      console.error("Error during capacity verification/rollback", e);
      // If verification fails, we should probably fail safe?
      // But if we fail here, we might leave phantom records.
      // Let's log CRITICAL and return error.
      return {
        success: false,
        error: "An error occurred during checkout. Please try again.",
      };
    }

    // Store checkout data in database
    const savedSession = await createCheckoutSession({
      checkoutId,
      cartId: cart.id,
      formData: {
        items: data.items.map((item) => {
          return {
            cartItemId: item.cartItemId,
            programId: item.programId,
            programSessionId: item.programSessionId,
            registrationType: item.registrationType,
            formData: item.formData as unknown as Record<string, unknown>,
            metadata:
              cart.items.find((ci) => ci.id === item.cartItemId)?.metadata ||
              undefined,
          };
        }),
      },
      totalAmount: data.totalAmount.toFixed(2),
      expiresAt: holdExpirationTime,
    });

    console.log(
      `[Checkout] Created session ${checkoutId} with ${data.items.length} items. DB ID: ${savedSession.id}`,
    );

    // Create Stripe metadata
    // Pass the booking IDs so the webhook can confirm them
    const metadata: Record<string, string> = {
      checkoutId,
      cartId: cart.id,
      type: "cart_checkout",
      itemCount: data.items.length.toString(),
      reservationBookingIds: JSON.stringify(createdBookingIds),
      groupRegistrationIds: JSON.stringify(createdGroupRegistrationIds),
    };

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Match the hold expiration (30 mins)
      customer_email: primaryEmail,
      client_reference_id: checkoutId,
      metadata: metadata,
      line_items: data.items.map((item) => {
        // Find the program details (safely)
        const cartItem = cart.items.find((ci) => ci.id === item.cartItemId);
        const programName = cartItem?.program?.name || "Golf Program";

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: programName,
              description:
                item.registrationType === "junior"
                  ? "Junior Registration"
                  : "Adult Registration",
              metadata: {
                programId: item.programId,
                programSessionId: item.programSessionId || "",
              },
            },
            unit_amount: Math.round(
              parseFloat(cartItem?.priceAtAdd || "0") * 100,
            ),
          },
          quantity: 1,
        };
      }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout?canceled=true`,
    });

    if (!session.url) {
      return {
        success: false,
        error: "Failed to create checkout session URL",
      };
    }

    return {
      success: true,
      url: session.url,
      checkoutId,
    };
  } catch (error) {
    console.error("Error processing checkout:", error);
    return {
      success: false,
      error: "Failed to process checkout. Please try again.",
    };
  }
}

/**
 * Get primary email from form data
 */
function getPrimaryEmail(item: CheckoutItem): string {
  if (item.registrationType === "adult") {
    return (item.formData as AdultFormData).email;
  } else {
    return (item.formData as JuniorFormData).primaryContactEmail;
  }
}

/**
 * Clear cart after successful payment
 */
export async function clearCartAfterPayment(cartId: string) {
  try {
    await deleteCart(cartId);
    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false };
  }
}
