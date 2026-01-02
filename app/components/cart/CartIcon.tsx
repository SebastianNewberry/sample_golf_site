"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";
import { motion, AnimatePresence } from "motion/react";

export function CartIcon() {
  const { itemCount, isLoading } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-300 transition-colors"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart size={22} className="text-gray-800" />
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
  );
}

