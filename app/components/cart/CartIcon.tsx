"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { motion, AnimatePresence } from "motion/react";
import { CartPopup } from "./CartPopup";

export function CartIcon() {
  const { itemCount, isLoading, cartAnimationTrigger } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileTapped, setIsMobileTapped] = useState(false);
  const [autoShow, setAutoShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoShowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const isCartPage = pathname === "/cart";

  // Close all popup states when route changes
  useEffect(() => {
    setIsHovered(false);
    setIsMobileTapped(false);
    setAutoShow(false);
  }, [pathname]);

  // Close mobile popup when tapping outside
  useEffect(() => {
    if (!isMobileTapped) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsMobileTapped(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileTapped]);

  // Handle auto-showing popup when item is added
  useEffect(() => {
    if (cartAnimationTrigger > 0) {
      setAutoShow(true);

      // Clear existing timeout if any
      if (autoShowTimeoutRef.current) clearTimeout(autoShowTimeoutRef.current);

      // Set new timeout to hide after 4 seconds
      autoShowTimeoutRef.current = setTimeout(() => {
        setAutoShow(false);
      }, 4000);
    }
  }, [cartAnimationTrigger]);

  // If user hovers while autoShow is active, clear autoShow to let hover take over
  useEffect(() => {
    if (isHovered && autoShow) {
      setAutoShow(false);
      if (autoShowTimeoutRef.current) clearTimeout(autoShowTimeoutRef.current);
    }
  }, [isHovered, autoShow]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoShowTimeoutRef.current) clearTimeout(autoShowTimeoutRef.current);
    };
  }, []);

  const isOpen =
    !isCartPage && (isHovered || isMobileTapped || autoShow);

  return (
    <div
      ref={containerRef}
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

      {/* Cart Popup - absolute, anchored to right edge */}
      <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 pt-6 z-50">
        <CartPopup
          isOpen={isOpen}
          setIsOpen={(open) => {
            setIsHovered(open);
            if (!open) setIsMobileTapped(false);
          }}
        />
      </div>
    </div>
  );
}
