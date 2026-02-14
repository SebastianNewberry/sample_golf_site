"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Lock, ArrowLeft } from "lucide-react";
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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // 1. Submit elements (validation)
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || "An unexpected error occurred.");
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
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.error("Validation error during payment", err);
      setErrorMessage("Failed to validate based on current availability.");
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
      setIsProcessing(false);
    } else {
      // The UI will likely redirect before this runs, but just in case
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-green-600" />
          Secure Payment
        </h3>
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex gap-4">
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
            `Pay $${totalAmount.toFixed(2)}`
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500 mt-4">
        Your payment information is encrypted and secure.
      </p>
    </form>
  );
}
