"use server";

import { getOrCreateRegularUser } from "@/db/queries/users";
import {
  createAdultRegistration,
  updateAdultRegistrationPaymentIntent,
} from "@/db/queries/adult-registrations";
import { createPaymentIntent } from "@/lib/stripe";

/**
 * Server action to initialize an adult registration (Step 1: Save data)
 * Workflow:
 * 1. Check if user exists by email
 * 2. If not, create new user account
 * 3. Create adult registration linked to user
 * 4. Create Stripe payment intent
 * 5. Save payment intent ID to registration (for tracking)
 * 6. Return payment intent details for checkout
 */
export async function initializeAdultRegistration(formData: {
  // User Information
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;

  // Program Information
  programId: string;
  programSessionId?: string;
  programPrice: number; // Price in dollars
  additionalComments?: string;
}) {
  try {
    // Step 1: Get or create the user
    const user = await getOrCreateRegularUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
    });

    // Step 2: Create the adult registration with pending payment status
    const registration = await createAdultRegistration({
      userId: user.id,
      programId: formData.programId,
      programSessionId: formData.programSessionId,
      additionalComments: formData.additionalComments,
    });

    // Step 3: Create Stripe payment intent with idempotency key
    const paymentResult = await createPaymentIntent({
      amount: Math.round(formData.programPrice * 100), // Convert to cents
      currency: "usd",
      customerEmail: formData.email,
      metadata: {
        userId: user.id,
        adultRegistrationId: registration.id,
        programId: formData.programId,
        programSessionId: formData.programSessionId || "",
        type: "adult_registration",
      },
      idempotencyKey: `adult-registration-${registration.id}`,
    });

    if (!paymentResult.success) {
      return {
        success: false,
        error: "Failed to create payment intent. Please try again.",
      };
    }

    // Step 4: Save payment intent ID to registration immediately
    // This allows us to track the payment and prevents orphaned registrations
    await updateAdultRegistrationPaymentIntent(
      registration.id,
      paymentResult.paymentIntentId!
    );

    return {
      success: true,
      userId: user.id,
      adultRegistrationId: registration.id,
      programId: formData.programId,
      programSessionId: formData.programSessionId,
      programPrice: formData.programPrice,
      clientSecret: paymentResult.clientSecret,
      paymentIntentId: paymentResult.paymentIntentId,
    };
  } catch (error) {
    console.error("Error initializing adult registration:", error);
    return {
      success: false,
      error: "Failed to initialize registration. Please try again.",
    };
  }
}

/**
 * Server action to complete adult registration after successful payment (Step 3: Complete)
 */
export async function completeAdultRegistration(params: {
  adultRegistrationId: string;
  paymentIntentId: string;
  paymentAmount: string;
  stripeCustomerId?: string;
}) {
  try {
    // Payment status update is handled by webhook
    // This action just confirms the registration flow

    return {
      success: true,
      message: "Registration completed successfully!",
    };
  } catch (error) {
    console.error("Error completing adult registration:", error);
    return {
      success: false,
      error: "Failed to complete registration. Please contact support.",
    };
  }
}
