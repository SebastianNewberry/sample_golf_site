"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { addToCart, checkSessionAvailability } from "@/app/actions/cart";
import { useCart } from "@/app/components/cart/CartContext";

interface BuyNowButtonProps {
  programId: string;
  programSessionId?: string;
  registrationType: "adult" | "junior";
  price: number;
  quantity?: number;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  disabled?: boolean;
}

export function BuyNowButton({
  programId,
  programSessionId,
  registrationType,
  price,
  className = "",
  size = "default",
  children,
  disabled = false,
  quantity = 1,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshCart, items } = useCart();

  const handleBuyNow = async () => {
    if (disabled) return;

    setIsLoading(true);

    try {
      // If adding a specific session, check capacity
      const addQuantity = Math.max(1, Math.floor(quantity));

      if (programSessionId) {
        const availability = await checkSessionAvailability(programSessionId);

        if (!availability.success) {
          alert("Failed to check availability");
          setIsLoading(false);
          return;
        }

        const { available, remaining } = availability;

        const inCartQuantity = items
          .filter((item) => item.programSessionId === programSessionId)
          .reduce((sum, item) => sum + item.quantity, 0);

        const maxCanAdd = (remaining ?? 0) - inCartQuantity;

        if (!available || maxCanAdd <= 0 || addQuantity > maxCanAdd) {
          alert(
            maxCanAdd <= 0
              ? "Sorry, no more spots available."
              : `Only ${maxCanAdd} ${maxCanAdd === 1 ? "spot is" : "spots are"} available.`,
          );
          setIsLoading(false);
          return;
        }
      }

      const result = await addToCart({
        programId,
        programSessionId,
        registrationType,
        price,
        quantity: addQuantity,
      });

      if (result.success) {
        await refreshCart();
        router.push("/checkout");
      } else {
        console.error("Failed to add to cart:", result.error);
        alert("Failed to proceed to checkout. Please try again.");
      }
    } catch (error) {
      console.error("Error during buy now:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBuyNow}
      disabled={isLoading || disabled}
      className={className}
      size={size}
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {children || "BUY NOW"}
        </>
      )}
    </Button>
  );
}
