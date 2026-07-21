"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Shimmer } from "@/app/components/Shimmer";
import { ContentFadeIn } from "@/app/components/ContentFadeIn";
import { ProgramPageTitle } from "@/app/components/ProgramPageTitle";
import { ProgramSidebarNav } from "@/app/components/ProgramSidebarNav";
import {
  programCardImageContainer,
  programCardImageFrame,
  programCardImageFrameTall,
  programPageContent,
  programPageGrid,
} from "@/app/components/program-page-layout";
import type { ProgramNavVariant } from "@/lib/program-nav-links";
import { getProgramMobileNavOpen } from "@/lib/use-program-sidebar-nav";

export { PageTitleShimmer, Shimmer } from "@/app/components/Shimmer";
export {
  programPageContent,
  programPageGrid,
  programPageGridCell,
  programPageShell,
} from "@/app/components/program-page-layout";

export const programPageSingleGrid = programPageGrid;

/** Desktop-only height reservation; not rendered below lg (1024px). */
function InvisibleCalendarSpacer() {
  return (
    <div className="mt-6 hidden lg:block lg:invisible" aria-hidden="true">
      <div className="relative overflow-visible rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <Shimmer className="mb-3 h-4 w-full rounded" />
        <div className="grid grid-cols-2 gap-2 overflow-visible">
          {[1, 2, 3].map((m) => (
            <div
              key={m}
              className="w-full overflow-visible rounded-lg border border-gray-200"
            >
              <div className="rounded-t-lg bg-green-600/80 px-1 py-1 text-center">
                <Shimmer className="mx-auto h-3 w-10 rounded-sm bg-green-500/50" />
              </div>
              <div className="grid grid-cols-7 bg-gray-100">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <div
                    key={d}
                    className="flex aspect-square items-center justify-center border-b border-gray-200"
                  >
                    <Shimmer className="h-2 w-2 rounded-sm bg-muted/60" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px rounded-b-lg bg-gray-200 p-0.5">
                {Array.from({ length: 35 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex aspect-square items-center justify-center bg-white"
                  >
                    {idx >= 2 && idx < 32 && (
                      <Shimmer
                        className={cn(
                          "h-4 w-4 rounded-sm",
                          [5, 8, 12, 15, 19, 22, 26].includes(idx)
                            ? "bg-green-400/60"
                            : "bg-muted/50",
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          {[1, 2].map((i) => (
            <div key={i} className="border-l-2 border-green-300 py-0.5 pl-3">
              <Shimmer className="mb-1 h-3.5 w-full rounded" />
              <Shimmer className="h-3 w-4/5 rounded bg-muted/60" />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-4 w-4 shrink-0 rounded-sm bg-green-500/50" />
          <Shimmer className="h-3 w-24 rounded bg-muted/60" />
        </div>
      </div>
      <Shimmer className="mt-2 h-3 w-full rounded bg-muted/50" />
    </div>
  );
}

/** Visible session schedule card — replaces the calendar for adult pages. */
function SessionScheduleCard() {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <Shimmer className="h-5 w-2/3 rounded" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between border-b border-gray-50 px-4 py-3 last:border-0"
        >
          <Shimmer className="h-4 min-w-0 flex-1 rounded" />
          <Shimmer className="ml-3 h-4 w-4 shrink-0 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

export function ProgramPageSkeleton({
  variant = "junior",
  tallImage = false,
}: {
  variant?: ProgramNavVariant;
  /** Golf for Women — matches taller hero frame */
  tallImage?: boolean;
}) {
  const imageFrame = tallImage
    ? programCardImageFrameTall
    : programCardImageFrame;
  const showMobileNav = getProgramMobileNavOpen();

  return (
    <div className={programPageContent}>
      <div className={programPageGrid}>
        {/* Left: nav + session area — no fade so route swaps are seamless */}
        <div className="space-y-2 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-4">
            <ProgramPageTitle variant={variant} />
            <span className="lg:hidden flex items-center self-center gap-0.5 text-[8px] font-semibold text-gray-500 px-1.5 py-0.5 whitespace-nowrap min-w-[90px] justify-center">
              {showMobileNav ? "Hide Programs" : "Show Programs"}
              {showMobileNav ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </span>
          </div>

          <ProgramSidebarNav variant={variant} mode="desktop" />
          {showMobileNav && (
            <div className="lg:hidden mb-2">
              <ProgramSidebarNav variant={variant} mode="mobile" />
            </div>
          )}

          <ContentFadeIn>
            <SessionScheduleCard />
            <InvisibleCalendarSpacer />
          </ContentFadeIn>
        </div>

        {/* Center: ProgramCard (title, copy, price, session, buttons) — not private instruction */}
        <ContentFadeIn className="min-w-0 lg:col-span-6">
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
        </ContentFadeIn>

        {/* Right */}
        <ContentFadeIn className="min-w-0 space-y-6 lg:col-span-4">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <Shimmer className="mb-4 h-8 w-full rounded" />
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
            <Shimmer className="mb-4 h-8 w-full rounded" />
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
        </ContentFadeIn>
      </div>
    </div>
  );
}
