"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/app/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  User,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CheckoutAdultForm } from "./CheckoutAdultForm";
import { CheckoutJuniorForm } from "./CheckoutJuniorForm";
import { processCheckout } from "@/app/actions/checkout";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CartItemFormData {
  cartItemId: string;
  programId: string;
  programSessionId?: string;
  registrationType: "adult" | "junior";
  formData: AdultFormData | JuniorFormData | null;
}

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

// Step indicator component
function StepIndicator({
  steps,
  currentStep,
}: {
  steps: { id: string; label: string; icon: React.ReactNode }[];
  currentStep: number;
}) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                index < currentStep
                  ? "bg-green-600 text-white"
                  : index === currentStep
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index < currentStep ? (
                <CheckCircle2 size={20} />
              ) : (
                step.icon
              )}
            </div>
            <span
              className={`text-xs mt-2 ${
                index <= currentStep ? "text-gray-800 font-medium" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mx-2 ${
                index < currentStep ? "bg-green-600" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Payment form component
function PaymentForm({
  total,
  onSuccess,
  onBack,
}: {
  total: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?success=true`,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "An error occurred");
      setIsProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
        <PaymentElement />
      </div>

      {message && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
          {message}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${total.toFixed(2)}`
          )}
        </Button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        Your payment information is secure and encrypted.
      </p>
    </form>
  );
}

// Success component
function CheckoutSuccess() {
  const { clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Registration Complete!
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Payment successful! You will receive a confirmation email shortly.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-8">
        <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
        <p className="text-green-700 text-sm">
          You will receive a confirmation email with all the details about your
          program registrations. Our team will reach out if any additional
          information is needed.
        </p>
      </div>
      <Button onClick={() => router.push("/")} className="bg-orange-500 hover:bg-orange-600">
        Return to Home
      </Button>
    </div>
  );
}

// Main checkout content
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, total, isLoading, refreshCart } = useCart();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [formDataList, setFormDataList] = useState<CartItemFormData[]>([]);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Check for success redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setIsSuccess(true);
    }
  }, [searchParams]);

  // Initialize form data list when items load
  useEffect(() => {
    if (items.length > 0 && formDataList.length === 0) {
      setFormDataList(
        items.map((item) => ({
          cartItemId: item.id,
          programId: item.programId,
          programSessionId: item.programSessionId || undefined,
          registrationType: item.registrationType as "adult" | "junior",
          formData: null,
        }))
      );
    }
  }, [items, formDataList.length]);

  // Steps definition
  const steps = [
    { id: "cart", label: "Review Cart", icon: <ShoppingCart size={18} /> },
    { id: "forms", label: "Registration", icon: <User size={18} /> },
    { id: "payment", label: "Payment", icon: <CreditCard size={18} /> },
  ];

  // Handle form submission for each item
  const handleFormSubmit = (
    index: number,
    data: AdultFormData | JuniorFormData
  ) => {
    const newFormDataList = [...formDataList];
    newFormDataList[index].formData = data;
    setFormDataList(newFormDataList);

    // Move to next form or next step
    if (index < items.length - 1) {
      setCurrentFormIndex(index + 1);
    } else {
      // All forms complete, process checkout
      handleProceedToPayment(newFormDataList);
    }
  };

  // Process checkout and create payment intent
  const handleProceedToPayment = async (allFormData: CartItemFormData[]) => {
    setIsProcessingCheckout(true);
    setCheckoutError("");

    try {
      const result = await processCheckout({
        items: allFormData.map((item) => ({
          cartItemId: item.cartItemId,
          programId: item.programId,
          programSessionId: item.programSessionId,
          registrationType: item.registrationType,
          formData: item.formData!,
        })),
        totalAmount: total,
      });

      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret);
        setCurrentStep(2);
      } else {
        setCheckoutError(result.error || "Failed to process checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-8 bg-white shadow-lg">
            <CheckoutSuccess />
          </Card>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some programs to your cart to checkout.
          </p>
          <Button onClick={() => router.push("/")} className="bg-orange-500 hover:bg-orange-600">
            Browse Programs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Error Message */}
        {checkoutError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
            {checkoutError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white shadow-lg">
              <AnimatePresence mode="wait">
                {/* Step 0: Review Cart */}
                {currentStep === 0 && (
                  <motion.div
                    key="cart-review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Review Your Cart
                    </h2>

                    <div className="space-y-4 mb-6">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-white font-bold">
                              {item.registrationType === "junior" ? "J" : "A"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {item.program?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.registrationType === "junior"
                                ? "Junior Program"
                                : "Adult Program"}
                              {item.quantity > 1 && ` × ${item.quantity}`}
                            </p>
                          </div>
                          <p className="font-bold text-green-700">
                            ${(parseFloat(item.priceAtAdd) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/cart")}
                        className="flex-1"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Edit Cart
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Continue to Registration
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Registration Forms */}
                {currentStep === 1 && (
                  <motion.div
                    key={`form-${currentFormIndex}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">
                        Registration {currentFormIndex + 1} of {items.length}
                      </p>
                      <h2 className="text-xl font-bold text-gray-900">
                        {items[currentFormIndex]?.program?.name}
                      </h2>
                      <p className="text-gray-600">
                        {items[currentFormIndex]?.registrationType === "junior"
                          ? "Complete the junior registration form below"
                          : "Complete the registration form below"}
                      </p>
                    </div>

                    {items[currentFormIndex]?.registrationType === "junior" ? (
                      <CheckoutJuniorForm
                        programId={items[currentFormIndex].programId}
                        programName={items[currentFormIndex].program?.name || ""}
                        initialData={formDataList[currentFormIndex]?.formData as JuniorFormData | null}
                        onSubmit={(data) => handleFormSubmit(currentFormIndex, data)}
                        onBack={() => {
                          if (currentFormIndex > 0) {
                            setCurrentFormIndex(currentFormIndex - 1);
                          } else {
                            setCurrentStep(0);
                          }
                        }}
                        isLast={currentFormIndex === items.length - 1}
                        isProcessing={isProcessingCheckout}
                      />
                    ) : (
                      <CheckoutAdultForm
                        programId={items[currentFormIndex].programId}
                        programName={items[currentFormIndex].program?.name || ""}
                        initialData={formDataList[currentFormIndex]?.formData as AdultFormData | null}
                        onSubmit={(data) => handleFormSubmit(currentFormIndex, data)}
                        onBack={() => {
                          if (currentFormIndex > 0) {
                            setCurrentFormIndex(currentFormIndex - 1);
                          } else {
                            setCurrentStep(0);
                          }
                        }}
                        isLast={currentFormIndex === items.length - 1}
                        isProcessing={isProcessingCheckout}
                      />
                    )}
                  </motion.div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 2 && clientSecret && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            colorPrimary: "#f97316",
                          },
                        },
                      }}
                    >
                      <PaymentForm
                        total={total}
                        onSuccess={() => setIsSuccess(true)}
                        onBack={() => {
                          setCurrentStep(1);
                          setCurrentFormIndex(items.length - 1);
                        }}
                      />
                    </Elements>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white sticky top-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate pr-2">
                      {item.program?.name}
                      {item.quantity > 1 && ` (×${item.quantity})`}
                    </span>
                    <span className="font-medium text-gray-800 shrink-0">
                      ${(parseFloat(item.priceAtAdd) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-green-700">${total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
