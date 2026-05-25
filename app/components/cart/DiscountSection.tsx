"use client";

import React, { useState } from "react";
import { Tag, Gift, Loader2, XIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { validateDiscountCode } from "@/app/actions/gift-cards";
import { useCart } from "./CartContext";

export function DiscountSection() {
  const { appliedDiscount, setAppliedDiscount } = useCart();
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountTypeTab, setDiscountTypeTab] = useState<"promo" | "gift_card">("promo");
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // Format raw 12-char code as XXXX-XXXX-XXXX for display
  const formatGiftCardDisplay = (raw: string) => {
    const clean = raw.replace(/-/g, "").slice(0, 12);
    const parts = [clean.slice(0, 4), clean.slice(4, 8), clean.slice(8, 12)].filter(Boolean);
    return parts.join("-");
  };

  const handleApplyDiscount = async () => {
    const rawCode = discountCode.replace(/-/g, "");
    if (!rawCode.trim()) return;
    setIsApplyingDiscount(true);
    setDiscountError("");

    try {
      const rawCode = discountCode.replace(/-/g, "");
      const result = await validateDiscountCode(rawCode.trim());
      if (result.valid && result.type) {
        setAppliedDiscount({
          type: result.type,
          discountId: result.discountId!,
          code: result.code!,
          discountType: result.discountType!,
          discountValue: result.discountValue!,
          balance: result.type === "gift_card" ? result.balance : undefined,
        });
        setDiscountCode("");
        setShowDiscountInput(false);
      } else {
        setDiscountError(result.error || "Invalid code");
      }
    } catch {
      setDiscountError("Failed to validate code. Please try again.");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  return (
    <div className="w-full">
      {appliedDiscount ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden">
            <Tag className="w-4 h-4 text-green-600 shrink-0" />
            <div className="truncate">
              <span className="text-sm font-semibold text-green-700">
                {appliedDiscount.code}
              </span>
              <span className="text-xs text-green-600 ml-1">
                {appliedDiscount.type === "gift_card"
                  ? `Gift Card`
                  : appliedDiscount.discountType === "percentage"
                    ? `${appliedDiscount.discountValue}% off`
                    : `$${formatPrice(appliedDiscount.discountValue)} off`}
              </span>
            </div>
          </div>
          <button
            onClick={handleRemoveDiscount}
            className="p-1 rounded-full hover:bg-green-100 transition-colors shrink-0"
            title="Remove discount"
          >
            <XIcon className="w-3.5 h-3.5 text-green-600" />
          </button>
        </div>
      ) : (
        <div>
          {!showDiscountInput ? (
            <button
              onClick={() => setShowDiscountInput(true)}
              className="text-sm text-[hsl(var(--golf-orange))] hover:text-[hsl(var(--golf-orange))]/80 font-medium transition-colors cursor-pointer"
            >
              Have a gift card or promo code?
            </button>
          ) : (
            <div className="space-y-4">
              {/* Tab Switcher */}
              <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => {
                    setDiscountTypeTab("promo");
                    setDiscountCode("");
                    setDiscountError("");
                  }}
                  className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                    discountTypeTab === "promo"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  Promo Code
                </button>
                <button
                  onClick={() => {
                    setDiscountTypeTab("gift_card");
                    setDiscountCode("");
                    setDiscountError("");
                  }}
                  className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                    discountTypeTab === "gift_card"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  Gift Card
                </button>
              </div>

              <div className="space-y-3 max-w-full overflow-hidden">
                {discountTypeTab === "promo" ? (
                  <div className="flex gap-2 text-primary w-full">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value.toUpperCase());
                        setDiscountError("");
                      }}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--golf-orange))]/50 focus:border-[hsl(var(--golf-orange))] uppercase tracking-wider w-full min-w-0"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <input
                      type="text"
                      value={formatGiftCardDisplay(discountCode)}
                      onChange={(e) => {
                        // Strip dashes, keep only alphanumeric, max 12 raw chars
                        const raw = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12);
                        setDiscountCode(raw);
                        setDiscountError("");
                      }}
                      placeholder="XXXX-XXXX-XXXX"
                      maxLength={14} // 12 chars + 2 dashes
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--golf-orange))]/50 focus:border-[hsl(var(--golf-orange))] uppercase tracking-[0.25em] font-mono text-center"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                    />
                    <p className="text-[10px] text-gray-400 text-center mt-1">
                      12-character gift card code
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={handleApplyDiscount}
                    disabled={
                      isApplyingDiscount || 
                      !discountCode.trim() || 
                      (discountTypeTab === "gift_card" && discountCode.length < 12)
                    }
                    className="bg-[hsl(var(--golf-orange))] hover:bg-[hsl(var(--golf-orange))]/90 text-xs w-full"
                  >
                    {isApplyingDiscount ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      `Apply ${discountTypeTab === "promo" ? "Promo" : "Gift Card"}`
                    )}
                  </Button>

                  {discountError && (
                    <p className="text-xs text-red-600 text-center">{discountError}</p>
                  )}

                  <button
                    onClick={() => {
                      setShowDiscountInput(false);
                      setDiscountCode("");
                      setDiscountError("");
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 text-center py-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
