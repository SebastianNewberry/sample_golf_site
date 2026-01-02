"use client";

import { useState } from "react";
import { AddToCartButton } from "@/app/components/AddToCartButton";
import { BuyNowButton } from "@/app/components/BuyNowButton";

interface Session {
  id: string;
  name: string;
}

interface ProgramPurchaseSectionProps {
  programId: string;
  programName: string;
  programPrice: number;
  duration: string;
  sessions: Session[];
}

export function ProgramPurchaseSection({
  programId,
  programName,
  programPrice,
  duration,
  sessions,
}: ProgramPurchaseSectionProps) {
  const [selectedSession, setSelectedSession] = useState<string>("");

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{programName}</h3>
        <p className="text-4xl font-bold text-green-700 mt-2">
          ${programPrice.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600 mt-1">{duration}</p>
      </div>

      {sessions.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dates/Sessions:
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">Select Dates/Sessions</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-3">
        {/* Buy Now Button - Primary action */}
        <BuyNowButton
          programId={programId}
          programSessionId={selectedSession || undefined}
          registrationType="adult"
          price={programPrice}
          className="w-full py-3 font-semibold bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
        >
          BUY NOW
        </BuyNowButton>

        {/* Add to Cart Button - Secondary action */}
        <AddToCartButton
          programId={programId}
          programSessionId={selectedSession || undefined}
          registrationType="adult"
          price={programPrice}
          className="w-full py-3 font-semibold"
          size="lg"
          variant="outline"
        >
          ADD TO CART
        </AddToCartButton>
      </div>

      <p className="text-xs text-gray-500 text-center mt-3">
        Complete registration forms at checkout
      </p>
    </div>
  );
}

