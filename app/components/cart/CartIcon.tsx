"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { motion } from "motion/react";
import { CartPopup } from "./CartPopup";

export function CartIcon() {
  const { itemCount, isLoading, cartAnimationTrigger } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileTapped, setIsMobileTapped] = useState(false);
  const [autoShow, setAutoShow] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoShowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevTriggerRef = useRef<number | null>(null);
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

  // Shake + popup only when an item is added — not on mount (e.g. opening mobile nav)
  useEffect(() => {
    if (prevTriggerRef.current === null) {
      prevTriggerRef.current = cartAnimationTrigger;
      return;
    }
    if (cartAnimationTrigger > prevTriggerRef.current) {
      setIsShaking(true);
      setAutoShow(true);

      if (autoShowTimeoutRef.current) clearTimeout(autoShowTimeoutRef.current);
      autoShowTimeoutRef.current = setTimeout(() => {
        setAutoShow(false);
      }, 4000);
    }
    prevTriggerRef.current = cartAnimationTrigger;
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

  const isOpen = !isCartPage && (isHovered || isMobileTapped || autoShow);

  return (
    <div
      ref={containerRef}
      className="relative z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href="/cart"
        className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-gray-300"
        aria-label={
          itemCount > 0 ? `Shopping cart (${itemCount})` : "Shopping cart"
        }
      >
        <motion.div
          animate={
            isShaking
              ? { rotate: [0, -10, 10, -10, 10, 0] }
              : { rotate: 0 }
          }
          transition={
            isShaking
              ? { duration: 0.5, ease: "easeInOut" }
              : { duration: 0 }
          }
          onAnimationComplete={() => setIsShaking(false)}
        >
          <ShoppingCart size={20} className="text-gray-800" />
        </motion.div>
        {!isLoading && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>

      {/* Cart Popup - absolute, anchored to right edge */}
      <div className="absolute top-full left-0 z-50 pt-2 md:left-1/2 md:-translate-x-1/2">
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
