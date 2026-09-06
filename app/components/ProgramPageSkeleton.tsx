"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { Shimmer } from "@/app/components/Shimmer";
import { ProgramSidebarLinks } from "@/app/components/ProgramSidebarLinks";
import { SessionSchedulePanel } from "@/app/components/SessionSchedulePanel";
import {
  getCatalogEntryByHref,
  type ProgramAudience,
} from "@/lib/program-catalog";
import {
  programCardImageContainer,
  programCardImageFrame,
  programCardImageFrameTall,
  programPageContent,
  programPageGrid,
} from "@/app/components/program-page-layout";

export { PageTitleShimmer, Shimmer } from "@/app/components/Shimmer";
export {
  programPageContent,
  programPageGrid,
  programPageGridCell,
  programPageShell,
} from "@/app/components/program-page-layout";

export const programPageSingleGrid = programPageGrid;

export function ProgramLoadingSidebar({
  type,
  slug,
  title,
}: {
  type: ProgramAudience;
  slug: string;
  title: string;
}) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <span className="lg:hidden flex items-center self-center gap-0.5 text-[8px] font-semibold text-gray-500 px-1.5 py-0.5 rounded-md whitespace-nowrap min-w-[90px] justify-center">
          Show Programs
          <ChevronDown className="w-3 h-3" />
        </span>
      </div>

      <div className="hidden space-y-0 lg:block">
        <ProgramSidebarLinks type={type} currentPage={slug} />
      </div>
    </>
  );
}

export function ProgramFeaturesDetailsSkeleton() {
  return (
    <>
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Program Features
        </h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Shimmer className="h-5 w-5 shrink-0 rounded-full" />
              <Shimmer className="h-5 min-w-0 flex-1 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Program Details
        </h2>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Shimmer className="mt-0.5 h-7 w-7 shrink-0 rounded" />
              <div className="min-w-0 flex-1 space-y-3">
                <Shimmer className="h-5 w-full rounded" />
                <Shimmer className="h-4 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function ProgramPageSkeleton({
  navRowCount: _navRowCount = 3,
  tallImage = false,
}: {
  /** Number of nav link rows in the left column. Adult pages use 6, junior use 3. */
  navRowCount?: number;
  /** Golf for Women — matches taller hero frame */
  tallImage?: boolean;
}) {
  const pathname = usePathname();
  const entry = getCatalogEntryByHref(pathname ?? "");
  const type: ProgramAudience =
    entry?.type ?? (pathname?.includes("junior") ? "junior" : "adult");
  const title = entry?.pageTitle ?? "";
  const slug = entry?.slug ?? "";
  const imageFrame =
    tallImage || entry?.hero === "tall"
      ? programCardImageFrameTall
      : programCardImageFrame;
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={programPageContent}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className={programPageGrid}>
        <div className="space-y-2 lg:col-span-3">
          <ProgramLoadingSidebar type={type} slug={slug} title={title} />
          <SessionSchedulePanel>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-gray-50 px-4 py-3 last:border-0"
              >
                <Shimmer className="h-4 min-w-0 flex-1 rounded" />
                <Shimmer className="ml-3 h-4 w-4 shrink-0 rounded-sm" />
              </div>
            ))}
          </SessionSchedulePanel>
        </div>

        <div className="min-w-0 lg:col-span-6">
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            <div className={programCardImageContainer}>
              <div className={`${imageFrame} bg-muted/50`}>
                <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-muted/60" />
              </div>
            </div>

            <div className="space-y-6 p-6 lg:p-8">
              <Shimmer className="h-6 w-[min(100%,32rem)] max-w-full rounded" />

              <div className="space-y-3">
                <Shimmer className="h-4 w-full rounded" />
                <Shimmer className="h-4 w-[96%] rounded" />
                <Shimmer className="h-4 w-[88%] rounded" />
              </div>

              <div className="flex flex-col items-center border-b border-gray-100 pb-4 text-center">
                <Shimmer className="mb-2 h-11 w-48 rounded-md" />
                <Shimmer className="h-4 w-32 rounded" />
              </div>

              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <Shimmer className="h-5 w-36 rounded" />
                  <Shimmer className="h-12 w-full rounded-md border border-gray-200/50 bg-muted/20" />
                </div>
                <div className="w-24 shrink-0 space-y-2">
                  <Shimmer className="h-5 w-20 rounded" />
                  <Shimmer className="h-12 w-full rounded-md border border-gray-200/50 bg-muted/20" />
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <Shimmer className="h-14 w-full rounded-lg" />
                <Shimmer className="h-14 w-full rounded-lg bg-muted/60" />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-4">
          <ProgramFeaturesDetailsSkeleton />
        </div>
      </div>
    </motion.div>
  );
}
