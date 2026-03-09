"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Lock, ArrowLeft, X } from "lucide-react";
import { validateCartAvailability } from "@/app/actions/validation";
import { useCart } from "@/app/components/cart/CartContext";

interface EmbeddedPaymentFormProps {
  clientSecret: string;
  totalAmount: number;
  onBack: () => void;
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

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-600" />
            Secure Payment
          </h3>
          <PaymentElement />
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
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-1 bg-green-600 enabled:hover:bg-green-700 text-white transition-all"
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
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          Your payment information is encrypted and secure.
        </p>
      </form>

      {/* Payment Error Modal */}
      {showErrorModal && errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowErrorModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-[90%] mx-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close error modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Payment Failed
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              {errorMessage}
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Try Again
              </Button>
              <Link
                href="/cart"
                className="text-sm text-center text-green-700 hover:text-green-800 hover:underline transition-colors"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
