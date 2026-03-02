"use client";

import React, { useEffect, useState } from "react";
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
  const {
    items,
    itemCount,
    total,
    cartAnimationTrigger,
    updateQuantity,
    removeItem,
  } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync internal visibility with external isOpen prop or animation trigger
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsVisible(isOpen);
      if (isOpen && timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [isOpen]);

  // Show popup when cartAnimationTrigger changes (item added)
  // But only if we are not already hovering (handled by parent usually)
  useEffect(() => {
    if (cartAnimationTrigger > 0) {
      if (setIsOpen) setIsOpen(true);
      else setIsVisible(true);

      // Auto-hide after 4 seconds
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (setIsOpen) setIsOpen(false);
        else setIsVisible(false);
      }, 4000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [cartAnimationTrigger, setIsOpen]);

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

  // Keep visible when hovering (handled by parent's isHovered state usually, but good fallback)
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (setIsOpen) setIsOpen(true);
    else setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      if (setIsOpen) setIsOpen(false);
      else setIsVisible(false);
    }, 1000);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <AnimatePresence>
        {isVisible && itemCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden md:-translate-x-1/2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Items List */}
            <div className="max-h-[300px] overflow-y-auto pt-2">
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
                    className={`p-3 border-b flex gap-3 last:border-0 transition-colors group relative ${hasInsufficientQuantity || isSoldOut
                      }`}
                  >
                    <button
                      onClick={(e) => handleRemoveItem(e, item.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={programImage || "/placeholder.png"}
                        alt={item.program?.name || "Program"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-gray-900 text-sm truncate pr-4">
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
                        <div className="flex items-center gap-2 mr-6">
                          <span className="text-sm font-bold text-gray-800">
                            $
                            {(
                              parseFloat(item.priceAtAdd) * item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-md bg-white">
                          {item.quantity <= 1 || isPrivateInstruction ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0} className="inline-flex cursor-not-allowed">
                                  <button
                                    onClick={(e) =>
                                      handleUpdateQuantity(e, item.id, item.quantity - 1)
                                    }
                                    disabled={item.quantity <= 1 || isPrivateInstruction}
                                    className="w-6 h-6 flex items-center justify-center text-gray-500 opacity-50 pointer-events-none"
                                  >
                                    -
                                  </button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>
                                  {isPrivateInstruction
                                    ? "Cannot change quantity for private instruction"
                                    : item.quantity <= 1
                                      ? "Minimum quantity is 1"
                                      : "Decrease quantity"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <button
                              onClick={(e) =>
                                handleUpdateQuantity(e, item.id, item.quantity - 1)
                              }
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
                            >
                              -
                            </button>
                          )}
                          <span className="text-xs font-medium w-4 text-center">
                            {item.quantity}
                          </span>
                          {item.quantity >= maxQuantity || isPrivateInstruction ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0} className="inline-flex cursor-not-allowed">
                                  <button
                                    disabled
                                    className="w-6 h-6 flex items-center justify-center text-gray-500 opacity-50 pointer-events-none"
                                  >
                                    +
                                  </button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>
                                  {isPrivateInstruction
                                    ? "Cannot change quantity for private instruction"
                                    : item.quantity >= maxQuantity
                                      ? "Session capacity reached"
                                      : "Add another"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <button
                              onClick={(e) =>
                                handleUpdateQuantity(e, item.id, item.quantity + 1)
                              }
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
                            >
                              +
                            </button>
                          )}
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
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  className="block"
                  onClick={() => {
                    if (setIsOpen) setIsOpen(false);
                    else setIsVisible(false);
                  }}
                >
                  <Button className="w-full bg-orange-500 enabled:hover:bg-orange-600 text-white shadow-sm cursor-pointer h-9 text-sm">
                    Checkout <ArrowRight size={14} className="ml-1" />
                  </Button>
                </Link>
                <Link
                  href="/cart"
                  className="block"
                  onClick={() => {
                    if (setIsOpen) setIsOpen(false);
                    else setIsVisible(false);
                  }}
                >
                  <Button
                    variant="outline"
                    className="w-full border-green-600 bg-green-50 text-green-700 enabled:hover:bg-green-200 enabled:hover:border-green-700 enabled:hover:text-green-700 cursor-pointer h-9 text-sm border-2"
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
