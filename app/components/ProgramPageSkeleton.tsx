"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { PageTitleShimmer, Shimmer } from "@/app/components/Shimmer";

export { PageTitleShimmer, Shimmer } from "@/app/components/Shimmer";

export const programPageShell = "mx-auto w-full min-w-0 max-w-[1400px]";
export const programPageGrid =
  "grid w-full grid-cols-1 gap-6 lg:grid-cols-13";
export const programPageSingleGrid = programPageGrid;

/** Invisible spacer — same outer dimensions as the calendar but nothing rendered. */
function InvisibleCalendarSpacer() {
  return (
    <div className="mt-6 invisible" aria-hidden="true">
      <div className="relative overflow-visible rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <Shimmer className="mb-3 h-4 w-full rounded" />
        <div className="grid grid-cols-3 gap-2 overflow-visible md:grid-cols-2">
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
  navRowCount = 3,
}: {
  /** Number of nav link rows in the left column. Adult pages use 6, junior use 3. */
  navRowCount?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={programPageShell}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className={programPageGrid}>
        {/* Left: nav + session area */}
        <div className="space-y-2 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-4">
            <PageTitleShimmer />
            <Shimmer className="h-6 min-w-[90px] w-[90px] shrink-0 rounded bg-gray-300/70 lg:hidden" />
          </div>

          <div className="hidden space-y-0 lg:block">
            {Array.from({ length: navRowCount }).map((_, i) => (
              <div key={i} className="flex items-center bg-white px-4 py-3">
                <Shimmer className="h-[1.125rem] min-h-[1.125rem] w-full rounded" />
              </div>
            ))}
          </div>

          <SessionScheduleCard />
          <InvisibleCalendarSpacer />
        </div>

        {/* Center */}
        <div className="min-w-0 lg:col-span-6">
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="relative aspect-[3/2] max-h-[350px] w-full bg-muted/50">
              <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-muted/60" />
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

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
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
        </div>

        {/* Right */}
        <div className="min-w-0 space-y-6 lg:col-span-4">
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
        </div>
      </div>
    </motion.div>
  );
}
