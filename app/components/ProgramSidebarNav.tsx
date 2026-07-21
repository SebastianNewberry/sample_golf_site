"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  getProgramNavActiveIndex,
  getProgramNavLinks,
  type ProgramNavVariant,
} from "@/lib/program-nav-links";

type ProgramSidebarNavProps = {
  variant: ProgramNavVariant;
  /** desktop: lg+ sidebar; mobile: compact list; both: render each breakpoint block */
  mode?: "desktop" | "mobile" | "both";
  onLinkClick?: () => void;
  className?: string;
};

type IndicatorRect = { top: number; height: number };

/**
 * The nav remounts on every route change (old page -> loading skeleton -> new
 * page). Remembering the bar's last position at module scope lets each fresh
 * mount slide the bar from where it previously was instead of snapping.
 */
const lastIndicatorRect = new Map<string, IndicatorRect>();

function ProgramNavLinks({
  variant,
  surface,
  onLinkClick,
  compact,
}: {
  variant: ProgramNavVariant;
  surface: "desktop" | "mobile";
  onLinkClick?: () => void;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const links = getProgramNavLinks(variant);
  const reduceMotion = useReducedMotion();
  const activeIndex = getProgramNavActiveIndex(pathname, variant);
  const memoryKey = `${variant}-${surface}`;

  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [rect, setRect] = useState<IndicatorRect | null>(null);
  const fromRectRef = useRef<IndicatorRect | null>(null);
  const capturedFromRef = useRef(false);

  useLayoutEffect(() => {
    if (activeIndex < 0) return;
    const item = itemRefs.current[activeIndex];
    if (!item) return;

    const next = { top: item.offsetTop, height: item.offsetHeight };

    // Capture the previous position once per mount (guards Strict Mode replays).
    if (!capturedFromRef.current) {
      capturedFromRef.current = true;
      fromRectRef.current = lastIndicatorRect.get(memoryKey) ?? null;
    }

    lastIndicatorRect.set(memoryKey, next);
    setRect(next);
  }, [activeIndex, memoryKey, compact]);

  const from = fromRectRef.current;

  return (
    <div className="relative space-y-0">
      {rect && activeIndex >= 0 && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-0 z-10 w-1 bg-orange-500"
          initial={
            reduceMotion || !from
              ? { top: rect.top, height: rect.height }
              : { top: from.top, height: from.height }
          }
          animate={{ top: rect.top, height: rect.height }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 380, damping: 34 }
          }
        />
      )}

      {links.map((link, index) => {
        const isActive = index === activeIndex;

        return (
          <Link
            key={link.href}
            href={link.href}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            onClick={onLinkClick}
            className={cn(
              "relative block bg-white px-4 text-sm transition-colors hover:bg-gray-50",
              compact ? "py-2.5" : "py-3",
              isActive
                ? "font-bold text-gray-800"
                : "font-medium text-gray-700",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

export function ProgramSidebarNav({
  variant,
  mode = "both",
  onLinkClick,
  className,
}: ProgramSidebarNavProps) {
  return (
    <>
      {(mode === "desktop" || mode === "both") && (
        <nav
          className={cn("hidden lg:block", className)}
          aria-label="Program navigation"
        >
          <ProgramNavLinks variant={variant} surface="desktop" />
        </nav>
      )}

      {(mode === "mobile" || mode === "both") && (
        <nav
          className={cn("lg:hidden", className)}
          aria-label="Program navigation"
        >
          <ProgramNavLinks
            variant={variant}
            surface="mobile"
            onLinkClick={onLinkClick}
            compact
          />
        </nav>
      )}
    </>
  );
}
