"use client";

import Link from "next/link";
import { useVisibleProgramLinks } from "@/app/components/ProgramVisibilityContext";
import type { ProgramAudience } from "@/lib/program-catalog";
import { cn } from "@/lib/utils";

export function ProgramSidebarLinks({
  type,
  currentPage,
  onNavigate,
  variant = "desktop",
}: {
  type: ProgramAudience;
  currentPage: string;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const links = useVisibleProgramLinks(type);

  return (
    <>
      {links.map((program) => {
        const isCurrent = currentPage === program.slug;
        return (
          <Link
            key={program.id}
            href={program.href}
            onClick={onNavigate}
            className={cn(
              "block bg-white text-sm",
              variant === "desktop" ? "px-4 py-3" : "px-4 py-2.5",
              isCurrent
                ? "border-l-4 border-orange-500 font-bold text-gray-800"
                : "font-medium text-gray-700 hover:bg-gray-50",
            )}
          >
            {program.sidebarLabel}
          </Link>
        );
      })}
    </>
  );
}
