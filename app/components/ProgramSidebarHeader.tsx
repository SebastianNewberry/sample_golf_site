"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const toggleClassName =
  "lg:hidden flex h-6 w-[92px] shrink-0 items-center justify-center gap-0.5 rounded-md px-1.5 text-[8px] font-semibold text-gray-500 whitespace-nowrap";

/**
 * Shared program sidebar title row.
 * Locks title + toggle widths so the heading does not reflow between
 * loading skeletons and the loaded page (or Show/Hide toggles).
 */
export function ProgramSidebarHeader({
  title,
  showNav,
  onToggle,
  interactive = true,
}: {
  title: string;
  showNav: boolean;
  onToggle?: () => void;
  /** false = skeleton placeholder (non-clickable) */
  interactive?: boolean;
}) {
  const label = showNav ? "Hide Programs" : "Show Programs";
  const Icon = showNav ? ChevronUp : ChevronDown;

  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h1 className="min-w-0 flex-1 text-2xl font-bold leading-tight text-gray-800">
        {title}
      </h1>
      {interactive ? (
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            toggleClassName,
            "cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-700",
          )}
        >
          {label}
          <Icon className="h-3 w-3 shrink-0" />
        </button>
      ) : (
        <span className={toggleClassName}>
          {label}
          <Icon className="h-3 w-3 shrink-0" />
        </span>
      )}
    </div>
  );
}
