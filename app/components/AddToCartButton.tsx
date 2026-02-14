"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useCart } from "@/app/components/cart/CartContext";
import { motion, AnimatePresence } from "motion/react";
import { checkSessionAvailability } from "@/app/actions/cart";

interface AddToCartButtonProps {
  programId: string;
  programSessionId?: string;
  registrationType: "adult" | "junior";
  price: number;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  children?: React.ReactNode;
  disabled?: boolean;
}

export function AddToCartButton({
  programId,
  programSessionId,
  registrationType,
  price,
  className = "",
  variant = "default",
  size = "default",
  children,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem, isAddingToCart, items } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    if (disabled) return;
    setError(null);

    // If adding a specific session, check capacity
    if (programSessionId) {
      // 1. Calculate how many we already have in cart
      const inCartQuantity = items
        .filter((item) => item.programSessionId === programSessionId)
        .reduce((sum, item) => sum + item.quantity, 0);

      // 2. Check server for availability
      const availability = await checkSessionAvailability(programSessionId);

      if (!availability.success) {
        setError("Failed to check availability");
        return;
      }

      const { available, remaining } = availability;

      // 3. Validate
      // If we confirm it's available, remaining includes the DB count.
      // We need to ensure remaining > inCartQuantity
      if (!available || remaining <= inCartQuantity) {
        setError("No more spots available");
        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
        return;
      }
    }

    const result = await addItem({
      programId,
      programSessionId,
      registrationType,
      price,
    });

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    } else {
      setError(result.error || "Failed to add");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Button
        onClick={handleAddToCart}
        disabled={isAddingToCart || disabled}
        className={`${
          variant === "default"
            ? "bg-orange-500 enabled:hover:bg-orange-600"
            : ""
        } ${className}`}
        variant={variant}
        size={size}
      >
        <AnimatePresence mode="wait">
          {isAddingToCart ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </motion.span>
          ) : showSuccess ? (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center"
            >
              <Check className="mr-2 h-4 w-4" />
              Added!
            </motion.span>
          ) : (
            <motion.span
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {children || "Add to Cart"}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
      {error && (
        <p className="text-red-500 text-xs mt-1 text-center font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
