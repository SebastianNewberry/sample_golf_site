"use server";

import stripe from "@/lib/stripe";

/**
 * Verify a Stripe payment intent status server-side.
 * Used on the checkout success page to confirm payment actually went through
 * before showing the success screen.
 */
export async function verifyPaymentStatus(paymentIntentId: string): Promise<{
  verified: boolean;
  status: string;
  error?: string;
}> {
  try {
    if (!paymentIntentId || !paymentIntentId.startsWith("pi_")) {
      return {
        verified: false,
        status: "invalid",
        error: "Invalid payment reference.",
      };
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      return { verified: true, status: "succeeded" };
    }

    if (paymentIntent.status === "processing") {
      return { verified: true, status: "processing" };
    }

    // Payment didn't actually succeed
    return {
      verified: false,
      status: paymentIntent.status,
      error: `Payment was not completed. Status: ${paymentIntent.status}`,
    };
  } catch (error) {
    console.error("[verifyPaymentStatus] Error:", error);
    return {
      verified: false,
      status: "error",
      error: "Unable to verify payment status. Please contact support.",
    };
  }
}
