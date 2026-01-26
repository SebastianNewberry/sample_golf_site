import { redirect } from "next/navigation";
import { getCart } from "@/app/actions/cart";
import { CheckoutClient } from "./CheckoutClient";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const isSuccess = params.success === "true";

  // Get cart server-side
  const cart = await getCart();

  // If cart is empty and not on success page, redirect to cart
  if (cart.itemCount === 0 && !isSuccess) {
    redirect("/cart");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
