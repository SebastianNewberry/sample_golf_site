"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";
import { motion, AnimatePresence } from "motion/react";
import { CartPopup } from "./CartPopup";

export function CartIcon() {
  const { itemCount, isLoading, cartAnimationTrigger } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href="/cart"
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-300 transition-colors"
        aria-label={`Shopping cart with ${itemCount} items`}
      >
        <motion.div
          key={cartAnimationTrigger}
          animate={{
            rotate: [0, -10, 10, -10, 10, 0],
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          <ShoppingCart size={22} className="text-gray-800" />
        </motion.div>
        <AnimatePresence>
          {!isLoading && itemCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
            >
              {itemCount > 99 ? "99+" : itemCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Mini Cart Popup - Left aligned on mobile (extends right), centered on desktop */}
      <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 pt-6">
        <CartPopup isOpen={isHovered} setIsOpen={setIsHovered} />
      </div>
    </div>
  );
}
