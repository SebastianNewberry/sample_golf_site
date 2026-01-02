"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useCart } from "./cart/CartContext";
import { motion, AnimatePresence } from "motion/react";

interface AddToCartButtonProps {
  programId: string;
  programSessionId?: string;
  registrationType: "adult" | "junior";
  price: number;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  children?: React.ReactNode;
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
}: AddToCartButtonProps) {
  const { addItem, isAddingToCart } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = async () => {
    const result = await addItem({
      programId,
      programSessionId,
      registrationType,
      price,
    });

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAddingToCart}
      className={`${
        variant === "default"
          ? "bg-orange-500 hover:bg-orange-600 text-white"
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
            className="flex items-center text-white"
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
  );
}

