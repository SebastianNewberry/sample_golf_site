'use server';

import { getOrCreateRegularUser } from '@/db/queries/users';
import {
  createJuniorRegistration,
  createJuniorProgramRegistration,
  updateJuniorProgramRegistrationPaymentIntent,
} from '@/db/queries/junior-registrations';
import { createPaymentIntent } from '@/lib/stripe';

/**
 * Server action to initialize a junior registration (Step 1: Save data)
 * Workflow:
 * 1. Check if parent/guardian user exists by email
 * 2. If not, create new user account with parent info
 * 3. Create junior registration linked to user
 * 4. Create junior program registration with pending status
 * 5. Create Stripe payment intent with idempotency key
 * 6. Save payment intent ID to program registration (for tracking)
 * 7. Return payment intent details for checkout
 */
export async function initializeJuniorRegistration(formData: {
  // Parent/Guardian Information (Primary Contact)
  primaryContactFirstName: string;
  primaryContactLastName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  phoneType: 'mobile' | 'home' | 'work';
  preferredContactMethod: 'text' | 'email';

  // Child Information
  childFirstName: string;
  childLastName: string;
  childAge: number;
  childExperienceLevel: string;
  hasOwnClubs: boolean;
  friendsToGroupWith?: string;
  additionalComments?: string;

  // Program Information
  programId: string;
  programSessionId?: string;
  programPrice: number; // Price in dollars
}) {
  try {
    // Step 1: Get or create the parent/guardian user
    const user = await getOrCreateRegularUser({
      firstName: formData.primaryContactFirstName,
      lastName: formData.primaryContactLastName,
      email: formData.primaryContactEmail,
      phoneNumber: formData.primaryContactPhone,
    });

    // Step 2: Create the junior registration
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

    // Step 3: Create junior program registration with pending status
    // This creates the link between the child and the specific program
    const programReg = await createJuniorProgramRegistration({
      juniorRegistrationId: juniorReg.id,
      programId: formData.programId,
      programSessionId: formData.programSessionId,
      paymentStatus: 'pending',
    });

    // Step 4: Create Stripe payment intent with idempotency key
    const paymentResult = await createPaymentIntent({
      amount: Math.round(formData.programPrice * 100), // Convert to cents
      currency: 'usd',
      customerEmail: formData.primaryContactEmail,
      metadata: {
        userId: user.id,
        juniorRegistrationId: juniorReg.id,
        juniorProgramRegistrationId: programReg.id,
        programId: formData.programId,
        programSessionId: formData.programSessionId || '',
        type: 'junior_registration',
      },
      idempotencyKey: `junior-registration-${programReg.id}`,
    });

    if (!paymentResult.success) {
      return {
        success: false,
        error: 'Failed to create payment intent. Please try again.',
      };
    }

    // Step 5: Save payment intent ID to program registration immediately
    // This allows us to track the payment and prevents orphaned registrations
    await updateJuniorProgramRegistrationPaymentIntent(
      programReg.id,
      paymentResult.paymentIntentId!
    );

    return {
      success: true,
      userId: user.id,
      juniorRegistrationId: juniorReg.id,
      juniorProgramRegistrationId: programReg.id,
      programId: formData.programId,
      programSessionId: formData.programSessionId,
      programPrice: formData.programPrice,
      clientSecret: paymentResult.clientSecret,
      paymentIntentId: paymentResult.paymentIntentId,
    };
  } catch (error) {
    console.error('Error initializing junior registration:', error);
    return {
      success: false,
      error: 'Failed to initialize registration. Please try again.',
    };
  }
}

/**
 * Server action to complete junior registration after successful payment
 *
 * Note: The actual payment status update is handled by the Stripe webhook.
 * This action is kept for any post-payment client-side confirmation needs,
 * but the webhook is the source of truth for payment status.
 */
export async function completeJuniorRegistration(params: {
  juniorRegistrationId: string;
  juniorProgramRegistrationId: string;
  programId: string;
  programSessionId?: string;
  paymentIntentId: string;
}) {
  try {
    // The webhook handler updates the payment status
    // This action just confirms the flow completed on the client side
    console.log(
      `Junior registration completion confirmed for program registration: ${params.juniorProgramRegistrationId}`
    );

    return {
      success: true,
      message: 'Registration completed successfully!',
    };
  } catch (error) {
    console.error('Error completing junior registration:', error);
    return {
      success: false,
      error: 'Failed to complete registration. Please contact support.',
    };
  }
}
