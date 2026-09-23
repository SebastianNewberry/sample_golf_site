"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/app/components/cart/CartContext";
import { checkSessionAvailability } from "@/app/actions/cart";
import { cn } from "@/lib/utils";
import {
  CartButtonLabel,
  type CartButtonStatus,
} from "@/app/components/CartButtonLabel";

interface AddToCartButtonProps {
  programId: string;
  programSessionId?: string;
  registrationType: "adult" | "junior";
  price: number;
  quantity?: number;
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
  quantity = 1,
}: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [status, setStatus] = useState<CartButtonStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const successTimer = useRef<number | null>(null);
  const errorTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (successTimer.current) window.clearTimeout(successTimer.current);
      if (errorTimer.current) window.clearTimeout(errorTimer.current);
    };
  }, []);

  const showError = (message: string) => {
    setError(message);
    if (errorTimer.current) window.clearTimeout(errorTimer.current);
    errorTimer.current = window.setTimeout(() => setError(null), 3000);
  };

  const handleAddToCart = async () => {
    if (disabled || status !== "idle") return;
    setError(null);
    setStatus("adding");

    const addQuantity = Math.max(1, Math.floor(quantity));

    if (programSessionId) {
      const inCartQuantity = items
        .filter((item) => item.programSessionId === programSessionId)
        .reduce((sum, item) => sum + item.quantity, 0);

      const availability = await checkSessionAvailability(programSessionId);

      if (!availability.success) {
        setStatus("idle");
        showError("Failed to check availability");
        return;
      }

      const { available, remaining } = availability;
      const maxCanAdd = (remaining ?? 0) - inCartQuantity;

      if (!available || maxCanAdd <= 0 || addQuantity > maxCanAdd) {
        setStatus("idle");
        showError(
          maxCanAdd <= 0
            ? "No more spots available"
            : `Only ${maxCanAdd} ${maxCanAdd === 1 ? "spot is" : "spots are"} available`,
        );
        return;
      }
    }

    const result = await addItem({
      programId,
      programSessionId,
      registrationType,
      price,
      quantity: addQuantity,
    });

    if (result.success) {
      setStatus("success");
      if (successTimer.current) window.clearTimeout(successTimer.current);
      successTimer.current = window.setTimeout(() => setStatus("idle"), 1000);
    } else {
      setStatus("idle");
      showError(result.error || "Failed to add");
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Button
        onClick={handleAddToCart}
        disabled={disabled}
        aria-busy={status === "adding"}
        className={cn(
          variant === "default" && "bg-orange-500 enabled:hover:bg-orange-600",
          status !== "idle" && "cursor-default",
          className,
        )}
        variant={variant}
        size={size}
      >
        <CartButtonLabel status={status} idleLabel={children || "Add to Cart"} />
      </Button>
      {error && (
        <p className="text-red-500 text-xs mt-1 text-center font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
