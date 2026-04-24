"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPrice } from "@/lib/utils";

// Re-using the program image map (simplified for popup)
const PROGRAM_IMAGE_MAP: Record<string, string> = {
  // Adult Programs
  "583078c5-6e1f-40fc-a1a0-8c1cc88a6d7b": "/golf_ready_level1.webp",
  "eb15499e-b573-4027-a2dc-1335bc7613b1": "/golf_ready_level2.webp",
  "9bc2b2b7-2774-4971-b469-4ce2a8d3a707": "/adult_short_game.webp",
  "9160a3a8-a652-4ddf-a13f-298336168e04": "/golf_for_women.webp",
  "f89b62ee-ffda-421d-a525-8bd2a580f24e": "/adult_private_instruction.webp",
  "0dc3ac70-8346-44c4-9ef6-b638ccbb9082": "/adult_open_practice.webp",

  // Junior Programs
  "0284e4eb-fd96-4626-9009-272b7d985d88": "/junior_beginner_series.webp",
  "cc6a73ca-95fb-4acb-be01-6cee4ce44475": "/junior_development_series.gif",
  "8102629d-9ec3-4034-beca-16683db482f2": "/junior_golf_camp.webp",
  "754bf4be-0ef6-4123-b5ff-b107e03c2f10": "/junior_private_instruction.webp",
};

interface CartPopupProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export function CartPopup({ isOpen, setIsOpen }: CartPopupProps) {
  const { items, itemCount, total, updateQuantity, removeItem } = useCart();

  // Get items in reverse order (newest first)
  const recentItems = [...items].reverse();

  // Handle quantity updates inside popup
  const handleUpdateQuantity = (
    e: React.MouseEvent,
    itemId: string,
    newQty: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Find item to check limits
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.session && newQty > item.quantity) {
      const enrolled = item.session.enrolledCount ?? 0;
      const maxAvailable = item.session.capacity - enrolled;
      if (newQty > maxAvailable) {
        return; // Prevent going over capacity
      }
    }

    if (newQty > 0) updateQuantity(itemId, newQty);
  };

  const handleRemoveItem = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem(itemId);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <AnimatePresence>
        {isOpen && itemCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[90vw] max-w-[400px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Items List */}
            <div className="max-h-[450px] md:max-h-[500px] overflow-y-auto pt-2">
              {recentItems.map((item) => {
                const programImage =
                  item.program?.imageUrl || PROGRAM_IMAGE_MAP[item.programId];

                // Compact session info
                let sessionInfo = "";
                if (item.session) {
                  try {
                    if (item.session.name) {
                      sessionInfo = item.session.name;
                    }
                  } catch (e) {
                    sessionInfo = "Session Selected";
                  }
                } else if (item.metadata) {
                  try {
                    const meta = JSON.parse(item.metadata);
                    if (meta.slots?.length > 0) {
                      sessionInfo = `${meta.slots.length} Session${meta.slots.length > 1 ? "s" : ""}`;
                    }
                  } catch (e) {
                    sessionInfo = "Private Instruction";
                  }
                }

                // Check if item is Private Instruction (should not allow quantity changes)
                const isPrivateInstruction =
                  item.program?.name?.toLowerCase().includes("private") ||
                  (item.metadata && !item.session);

                // Calculate max quantity if session exists
                let maxQuantity = Infinity;
                let isSoldOut = false;
                let hasInsufficientQuantity = false;

                if (item.session) {
                  const enrolled = item.session.enrolledCount ?? 0;
                  maxQuantity = Math.max(0, item.session.capacity - enrolled);
                  isSoldOut = maxQuantity === 0;
                  hasInsufficientQuantity = item.quantity > maxQuantity;
                }

                // Check for new availability property
                if (item.availability && !item.availability.isAvailable) {
                  isSoldOut = true; // Treat as sold out/unavailable for styling
                }

                return (
                  <div
                    key={item.id}
                    className={`p-3 border-b flex gap-3 last:border-0 transition-colors group relative ${
                      hasInsufficientQuantity || isSoldOut ? "bg-red-50" : ""
                    }`}
                  >
                    <button
                      onClick={(e) => handleRemoveItem(e, item.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 md:h-16 md:w-16">
                      <Image
                        src={programImage || "/placeholder.png"}
                        alt={item.program?.name || "Program"}
                        fill
                        className="object-contain"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="w-full pr-8">
                          <p className="font-bold text-gray-900 text-xs md:text-sm">
                            {item.program?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {sessionInfo}
                          </p>
                          {(hasInsufficientQuantity || isSoldOut) && (
                            <p className="text-xs text-red-600 font-bold mt-1">
                              {item.availability?.error ||
                                (isSoldOut
                                  ? "Sold Out (0 available)"
                                  : `Only ${maxQuantity} available`)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-md bg-white">
                          {(() => {
                            // For private instructions, get the base player count from metadata
                            let minQuantity = 1;
                            if (isPrivateInstruction && item.metadata) {
                              try {
                                const meta = JSON.parse(item.metadata);
                                if (
                                  meta.playersCount &&
                                  meta.playersCount > 0
                                ) {
                                  minQuantity = meta.playersCount;
                                }
                              } catch {}
                            }
                            const isAtMinimum = item.quantity <= minQuantity;

                            return isAtMinimum ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    tabIndex={0}
                                    className="inline-flex cursor-not-allowed"
                                  >
                                    <button
                                      disabled
                                      className="w-6 h-6 flex items-center justify-center text-gray-500 opacity-50 pointer-events-none"
                                    >
                                      -
                                    </button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p>
                                    {isPrivateInstruction
                                      ? `Minimum ${minQuantity} player${minQuantity !== 1 ? "s" : ""} for this package`
                                      : "Minimum quantity is 1"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <button
                                onClick={(e) =>
                                  handleUpdateQuantity(
                                    e,
                                    item.id,
                                    item.quantity - 1,
                                  )
                                }
                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
                              >
                                -
                              </button>
                            );
                          })()}
                          <span className="text-xs font-medium min-w-[3rem] text-center whitespace-nowrap px-2">
                            {item.quantity} Player
                            {item.quantity !== 1 ? "s" : ""}
                          </span>
                          {item.quantity >= maxQuantity &&
                          !isPrivateInstruction ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  tabIndex={0}
                                  className="inline-flex cursor-not-allowed"
                                >
                                  <button
                                    disabled
                                    className="w-6 h-6 flex items-center justify-center text-gray-500 opacity-50 pointer-events-none"
                                  >
                                    +
                                  </button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Session capacity reached</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <button
                              onClick={(e) =>
                                handleUpdateQuantity(
                                  e,
                                  item.id,
                                  item.quantity + 1,
                                )
                              }
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
                            >
                              +
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="text-sm font-bold text-gray-800">
                            ${formatPrice(
                              Math.round(
                                parseFloat(item.priceAtAdd) *
                                  item.quantity *
                                  100,
                              ) / 100
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer / Summary */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">
                  ${formatPrice(total)}
                </span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  className="block"
                  onClick={() => setIsOpen && setIsOpen(false)}
                >
                  <Button className="w-full bg-orange-500 enabled:hover:bg-orange-600 text-white shadow-sm cursor-pointer h-8 md:h-9 text-xs md:text-sm">
                    Checkout <ArrowRight size={14} className="ml-1" />
                  </Button>
                </Link>
                <Link
                  href="/cart"
                  className="block"
                  onClick={() => setIsOpen && setIsOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full border-green-600 bg-green-50 text-green-700 enabled:hover:bg-green-200 enabled:hover:border-green-700 enabled:hover:text-green-700 cursor-pointer h-8 md:h-9 text-xs md:text-sm border-2"
                  >
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
