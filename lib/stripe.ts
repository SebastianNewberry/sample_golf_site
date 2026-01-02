import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Create a Stripe Payment Intent for program registration
 * Now supports idempotency keys to prevent duplicate charges on retries
 */
export async function createPaymentIntent(params: {
  amount: number; // Amount in cents
  currency?: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  idempotencyKey?: string; // Prevents duplicate payment intents on retry
}) {
  try {
    const createParams: Stripe.PaymentIntentCreateParams = {
      amount: params.amount,
      currency: params.currency || 'usd',
      metadata: params.metadata || {},
      ...(params.customerEmail && {
        receipt_email: params.customerEmail,
      }),
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // Use idempotency key if provided to prevent duplicate charges
    const options: Stripe.RequestOptions = params.idempotencyKey
      ? { idempotencyKey: params.idempotencyKey }
      : {};

    const paymentIntent = await stripe.paymentIntents.create(createParams, options);

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: 'Failed to create payment intent',
    };
  }
}

/**
 * Retrieve a Payment Intent from Stripe
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return {
      success: false,
      error: 'Failed to retrieve payment intent',
    };
  }
}

/**
 * Create a Stripe Customer
 */
export async function createCustomer(params: {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      phone: params.phone,
      metadata: params.metadata || {},
    });

    return {
      success: true,
      customerId: customer.id,
      customer,
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      success: false,
      error: 'Failed to create customer',
    };
  }
}

/**
 * Get or create a Stripe customer by email
 */
export async function getOrCreateCustomer(params: {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}) {
  try {
    // Search for existing customer
    const existingCustomers = await stripe.customers.list({
      email: params.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return {
        success: true,
        customerId: existingCustomers.data[0].id,
        customer: existingCustomers.data[0],
      };
    }

    // Create new customer if not found
    return await createCustomer(params);
  } catch (error) {
    console.error('Error getting/creating customer:', error);
    return {
      success: false,
      error: 'Failed to get or create customer',
    };
  }
}

/**
 * Confirm a Payment Intent (called after user completes payment)
 */
export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    return {
      success: false,
      error: 'Failed to confirm payment intent',
    };
  }
}

/**
 * Cancel a Payment Intent
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error cancelling payment intent:', error);
    return {
      success: false,
      error: 'Failed to cancel payment intent',
    };
  }
}

/**
 * Verify webhook signature (for processing Stripe webhooks)
 */
export function constructWebhookEvent(payload: string, signature: string, secret: string) {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return {
      success: true,
      event,
    };
  } catch (error) {
    console.error('Error constructing webhook event:', error);
    return {
      success: false,
      error: 'Webhook signature verification failed',
    };
  }
}

/**
 * Convert price to cents for Stripe
 */
export function priceToCents(price: number | string): number {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return Math.round(numPrice * 100);
}

/**
 * Convert cents to price from Stripe
 */
export function centsToPrice(cents: number): number {
  return cents / 100;
}

export default stripe;

