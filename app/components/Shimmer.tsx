"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const shimmerSweepTransition = {
  duration: 1.6,
  repeat: Infinity,
  ease: "linear" as const,
  repeatDelay: 0.35,
};

type ShimmerProps = {
  className?: string;
  /** Highlight strength of the moving shine (0–1). */
  highlightOpacity?: number;
};

/**
 * Animated skeleton bar with a sweeping shine (Framer Motion).
 * Works in loading.tsx boundaries via a client component boundary.
 */
export function Shimmer({
  className,
  highlightOpacity = 0.55,
}: ShimmerProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        className={cn("rounded-md bg-muted/80 animate-pulse", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/80",
        className,
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-2/5 min-w-[2.5rem]"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,${highlightOpacity}), transparent)`,
        }}
        initial={{ x: "-120%" }}
        animate={{ x: ["-120%", "320%"] }}
        transition={shimmerSweepTransition}
      />
    </div>
  );
}

/** Page title placeholder — matches `text-2xl` heading with the same shine. */
export function PageTitleShimmer({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        className={cn(
          "h-8 min-h-[2rem] w-full flex-1 rounded bg-gray-300/70 animate-pulse",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative h-8 min-h-[2rem] w-full flex-1 overflow-hidden rounded bg-gray-300/70",
        className,
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-2/5 min-w-[2.5rem]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
        }}
        initial={{ x: "-120%" }}
        animate={{ x: ["-120%", "320%"] }}
        transition={shimmerSweepTransition}
      />
    </div>
  );
}
