"use client";

import { usePathname } from "next/navigation";
import { getProgramPageTitle, type ProgramNavVariant } from "@/lib/program-nav-links";

/** Real program page title for skeletons / shared chrome (no shimmer). */
export function ProgramPageTitle({
  variant,
  fallback,
  className = "text-2xl font-bold text-gray-800",
}: {
  variant: ProgramNavVariant;
  fallback?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const title = getProgramPageTitle(pathname, variant) ?? fallback;

  if (!title) return null;

  return <h1 className={className}>{title}</h1>;
}
