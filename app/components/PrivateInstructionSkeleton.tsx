"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Shimmer } from "@/app/components/Shimmer";
import { ContentFadeIn } from "@/app/components/ContentFadeIn";
import { ProgramPageTitle } from "@/app/components/ProgramPageTitle";
import { ProgramSidebarNav } from "@/app/components/ProgramSidebarNav";
import {
  programCardImageContainer,
  programCardImageFrameJuniorPrivate,
  programCardImageFrameTall,
  programPageContent,
  programPageGrid,
} from "@/app/components/program-page-layout";
import { getProgramMobileNavOpen } from "@/lib/use-program-sidebar-nav";

type PrivateInstructionLayout = "adult" | "junior";

const layoutSpans: Record<
  PrivateInstructionLayout,
  { center: string; right: string }
> = {
  adult: { center: "lg:col-span-6", right: "lg:col-span-4" },
  junior: { center: "lg:col-span-6", right: "lg:col-span-4" },
};

/**
 * Skeleton for private instruction pages.
 * Adult and junior pages use different 13-column splits — must match each client.
 */
export function PrivateInstructionSkeleton({
  layout = "junior",
}: {
  layout?: PrivateInstructionLayout;
}) {
  const spans = layoutSpans[layout];
  const imageFrame =
    layout === "junior"
      ? programCardImageFrameJuniorPrivate
      : programCardImageFrameTall;
  const showMobileNav = getProgramMobileNavOpen();

  return (
    <div className={programPageContent}>
      <div className={programPageGrid}>
        {/* Left: nav + SessionCalendar summary — no fade so route swaps are seamless */}
        <div className="space-y-2 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-4">
            <ProgramPageTitle variant={layout} />
            <span className="lg:hidden flex items-center self-center gap-0.5 text-[8px] font-semibold text-gray-500 px-1.5 py-0.5 whitespace-nowrap min-w-[90px] justify-center">
              {showMobileNav ? "Hide Programs" : "Show Programs"}
              {showMobileNav ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </span>
          </div>

          <ProgramSidebarNav variant={layout} mode="desktop" />
          {showMobileNav && (
            <div className="lg:hidden mb-2">
              <ProgramSidebarNav variant={layout} mode="mobile" />
            </div>
          )}

          <ContentFadeIn className="mt-6">
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
                  <div
                    key={i}
                    className="border-l-2 border-green-300 py-0.5 pl-3"
                  >
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
          </ContentFadeIn>
        </div>

        {/* Center: hero + description + pricing + scheduling */}
        <ContentFadeIn className={cn("min-w-0", spans.center)}>
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            <div className={programCardImageContainer}>
              <div className={`${imageFrame} bg-muted/50`}>
                <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-muted/60" />
              </div>
            </div>

            <div className="space-y-8 p-6 lg:p-8">
              <Shimmer className="h-6 w-full rounded" />

              <div className="space-y-4">
                <Shimmer className="h-4 w-full rounded" />
                <Shimmer className="h-4 w-full rounded" />
                <Shimmer className="h-4 w-full rounded" />
              </div>
              <div className="space-y-4">
                <Shimmer className="h-4 w-full rounded" />
                <Shimmer className="h-4 w-full rounded" />
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100/80">
                    <Shimmer className="h-3.5 w-2.5 rounded-sm bg-green-300/60" />
                  </div>
                  <Shimmer className="h-5 min-w-0 flex-1 rounded" />
                </div>

                <div
                  className={cn(
                    "grid gap-4",
                    layout === "adult"
                      ? "grid-cols-2 md:grid-cols-3"
                      : "grid-cols-2 md:grid-cols-4",
                  )}
                >
                  {(layout === "adult" ? [1, 2, 3] : [1, 2, 3, 4]).map((i) => (
                    <div
                      key={i}
                      className="flex min-h-[8rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-gray-100 bg-white p-4 shadow-sm"
                    >
                      <Shimmer className="h-4 w-full rounded" />
                      <Shimmer className="h-8 w-full rounded" />
                      <Shimmer className="h-3 w-full rounded bg-muted/50" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <div className="flex flex-col gap-8 md:flex-row">
                  <div className="min-w-0 flex-1">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100/80">
                        <Shimmer className="h-3.5 w-2.5 rounded-sm bg-green-300/60" />
                      </div>
                      <Shimmer className="h-5 min-w-0 flex-1 rounded" />
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
                      <Shimmer className="mb-2 h-4 w-full rounded" />
                      <Shimmer className="mb-6 h-3 w-full rounded bg-muted/50" />
                      <Shimmer className="h-14 w-full rounded-xl border-2 border-green-200/50 bg-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100/80">
                        <Shimmer className="h-3.5 w-2.5 rounded-sm bg-green-300/60" />
                      </div>
                      <Shimmer className="h-5 min-w-0 flex-1 rounded" />
                    </div>
                    <div className="space-y-3">
                      <Shimmer className="h-12 w-full rounded-xl" />
                      <Shimmer className="h-12 w-full rounded-xl bg-muted/60" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-stretch border-t pt-6">
                  <Shimmer className="mb-3 h-4 w-full rounded bg-muted/50" />
                  <Shimmer className="h-4 w-full rounded" />
                </div>
              </div>
            </div>
          </div>
        </ContentFadeIn>

        {/* Right: features + details */}
        <ContentFadeIn className={cn("min-w-0 space-y-6", spans.right)}>
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
