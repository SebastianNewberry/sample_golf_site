"use client";

import React, { useState } from "react";
import type { StripePaymentElementChangeEvent } from "@stripe/stripe-js";
import Link from "next/link";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, AlertCircle, Lock, ArrowLeft } from "lucide-react";
import { validateCartAvailability } from "@/app/actions/validation";
import { useCart } from "@/app/components/cart/CartContext";

interface EmbeddedPaymentFormProps {
  clientSecret: string;
  totalAmount: number;
  onBack: () => void;
}

/** Stripe may include `error` on change events at runtime; types are not always up to date. */
function getPaymentElementErrorMessage(
  event: StripePaymentElementChangeEvent,
): string | null {
  const withError = event as StripePaymentElementChangeEvent & {
    error?: { message?: string };
  };
  return withError.error?.message?.trim() || null;
}

export function EmbeddedPaymentForm({
  clientSecret,
  totalAmount,
  onBack,
}: EmbeddedPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { items } = useCart();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [paymentFieldError, setPaymentFieldError] = useState<string | null>(
    null,
  );

  const handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    setIsPaymentComplete(event.complete);
    const fieldErr = getPaymentElementErrorMessage(event);
    setPaymentFieldError(fieldErr);
    if (fieldErr) {
      setShowErrorModal(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setShowErrorModal(false);

    // 1. Submit elements (validation)
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || "An unexpected error occurred.");
      setShowErrorModal(true);
      setIsProcessing(false);
      return;
    }

    // 2. Final Availability Check (Optimistic Concurrency)
    // We check one last time before charging the card
    try {
      const validation = await validateCartAvailability(items);
      if (!validation.valid) {
        setErrorMessage(
          validation.error ||
            "One of the items in your cart is no longer available.",
        );
        setShowErrorModal(true);
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.error("Validation error during payment", err);
      setErrorMessage("Failed to validate based on current availability.");
      setShowErrorModal(true);
      setIsProcessing(false);
      return;
    }

    // 3. Confirm Payment
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?success=true`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "Payment failed.");
      setShowErrorModal(true);
      setIsProcessing(false);
    } else {
      // The UI will likely redirect before this runs, but just in case
    }
  };

  const submitDisabled = !stripe || isProcessing || !isPaymentComplete;

  const completeOrderDisabledHint = (): string => {
    if (isProcessing) {
      return "Your payment is being processed. Please wait.";
    }
    if (!stripe) {
      return "Loading the secure payment form. Try again in a moment.";
    }
    if (paymentFieldError) {
      return `Payment details are not complete: ${paymentFieldError}`;
    }
    return "Fill out your payment details above before ordering.";
  };

  const completeOrderButtonClass =
    "flex-1 bg-green-600 enabled:hover:bg-green-700 text-white transition-all";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-600" />
            Secure Payment
          </h3>
          <PaymentElement onChange={handlePaymentChange} />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-4">
          <Button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 border-green-600 text-green-700 enabled:hover:bg-green-50 enabled:hover:text-green-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back To Registration
          </Button>
          <div className="flex min-w-0 flex-1">
            <TooltipProvider delayDuration={200}>
              {submitDisabled ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      tabIndex={0}
                      className="flex min-w-0 w-full cursor-not-allowed rounded-md outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                    >
                      <Button
                        type="submit"
                        disabled
                        className={`${completeOrderButtonClass} pointer-events-none w-full flex-1 cursor-not-allowed`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Complete Order"
                        )}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    sideOffset={8}
                    className="max-w-xs text-left text-xs leading-snug bg-gray-900 text-white border-gray-800"
                  >
                    {completeOrderDisabledHint()}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button type="submit" className={completeOrderButtonClass}>
                  Complete Order
                </Button>
              )}
            </TooltipProvider>
          </div>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          Your payment information is encrypted and secure.
        </p>
      </form>

      <Dialog
        open={Boolean(showErrorModal && errorMessage)}
        onOpenChange={(open) => {
          if (!open) setShowErrorModal(false);
        }}
      >
        <DialogContent className="max-w-md gap-0 overflow-hidden border-gray-200 bg-white/95 p-0 shadow-2xl backdrop-blur-xl sm:rounded-xl [&>button]:text-gray-500 [&>button]:hover:text-gray-800">
          <div className="border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/40 p-6 pr-14">
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-xl border border-red-100 bg-red-50/90 p-3 text-red-700 shadow-sm">
                <AlertCircle className="h-6 w-6" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-2 text-left">
                <DialogTitle className="text-xl font-bold tracking-tight text-gray-900">
                  Payment Failed
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-gray-600">
                  {errorMessage}
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-gray-100/80 bg-gray-50/60 p-6">
            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full shadow-md"
              onClick={() => setShowErrorModal(false)}
            >
              Try Again
            </Button>
            <Link
              href="/cart"
              className="inline-flex h-14 w-full items-center justify-center rounded-md border-2 border-gray-200 bg-white text-base font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              Return to Cart
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
