"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { addToCart } from "@/app/actions/cart";
import { useCart } from "@/app/components/cart/CartContext";

interface BuyNowButtonProps {
  programId: string;
  programSessionId?: string;
  registrationType: "adult" | "junior";
  price: number;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function BuyNowButton({
  programId,
  programSessionId,
  registrationType,
  price,
  className = "",
  size = "default",
  children,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshCart } = useCart();

  const handleBuyNow = async () => {
    setIsLoading(true);

    try {
      // Add item to cart
      const result = await addToCart({
        programId,
        programSessionId,
        registrationType,
        price,
      });

      if (result.success) {
        await refreshCart();
        // Immediately redirect to checkout
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
      disabled={isLoading}
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

