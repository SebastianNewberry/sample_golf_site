import { headers } from "next/headers";
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
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
  completeCheckoutSession,
} from "@/db/queries/checkout-sessions";
import { deleteCart } from "@/db/queries/cart";

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

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Stripe webhook secret is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
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
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 * Creates registrations for cart checkouts or updates existing registrations
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log("Payment succeeded:", paymentIntent.id);

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
  const checkoutSession = await getCheckoutSessionByPaymentIntentId(
    paymentIntent.id
  );

  if (!checkoutSession) {
    console.error(
      `No checkout session found for payment intent ${paymentIntent.id}`
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

  // Process each item in the checkout
  for (const item of formData.items) {
    try {
      if (item.registrationType === "adult") {
        await createAdultRegistrationFromCheckout(
          item,
          paymentIntent.id,
          paymentIntent.customer as string | undefined,
          pricePerItem
        );
      } else if (item.registrationType === "junior") {
        await createJuniorRegistrationFromCheckout(
          item,
          paymentIntent.id,
          paymentIntent.customer as string | undefined,
          pricePerItem
        );
      }
    } catch (error) {
      console.error(`Error processing item ${item.cartItemId}:`, error);
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
  paymentAmount: string
) {
  const formData = item.formData as {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    additionalComments?: string;
  };

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
    additionalComments: formData.additionalComments,
    stripePaymentIntentId: paymentIntentId,
    stripeCustomerId: stripeCustomerId,
    paymentStatus: "paid",
    paymentAmount: paymentAmount,
  });

  console.log(`Adult registration created: ${registration.id}`);
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
  paymentAmount: string
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
    paymentStatus: "paid",
    paymentAmount: paymentAmount,
  });

  console.log(
    `Junior registration created: ${juniorReg.id}, program registration: ${programReg.id}`
  );
  return { juniorReg, programReg };
}

/**
 * Handle legacy adult registration (direct checkout without cart)
 */
async function handleLegacyAdultRegistration(paymentIntent: any) {
  const registration = await getAdultRegistrationByPaymentIntentId(
    paymentIntent.id
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
      `No adult registration found for payment intent ${paymentIntent.id}`
    );
  }
}

/**
 * Handle legacy junior registration (direct checkout without cart)
 */
async function handleLegacyJuniorRegistration(paymentIntent: any) {
  const registration = await getJuniorProgramRegistrationByPaymentIntentId(
    paymentIntent.id
  );

  if (registration) {
    await updateJuniorProgramRegistrationPaymentStatus(registration.id, {
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: paymentIntent.customer as string | undefined,
      paymentStatus: "paid",
      paymentAmount: (paymentIntent.amount / 100).toFixed(2),
    });
    console.log(
      `Junior program registration ${registration.id} marked as paid`
    );
  } else {
    console.error(
      `No junior program registration found for payment intent ${paymentIntent.id}`
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
      paymentIntent.id
    );
    if (registration) {
      await updateAdultRegistrationPaymentStatus(registration.id, {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "failed",
      });
    }
  } else if (metadata.type === "junior_registration") {
    const registration = await getJuniorProgramRegistrationByPaymentIntentId(
      paymentIntent.id
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
      paymentIntent.id
    );
    if (registration) {
      await updateAdultRegistrationPaymentStatus(registration.id, {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "cancelled",
      });
    }
  } else if (metadata.type === "junior_registration") {
    const registration = await getJuniorProgramRegistrationByPaymentIntentId(
      paymentIntent.id
    );
    if (registration) {
      await updateJuniorProgramRegistrationPaymentStatus(registration.id, {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "cancelled",
      });
    }
  }
}

export const runtime = "nodejs";
