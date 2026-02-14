"use client";

import React, { Suspense } from "react";
import CartContent from "./CartContent";
import { Loader2 } from "lucide-react";

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}
