import React from "react";
import { cn } from "@/lib/utils";
import { Shimmer, programPageGrid } from "./ProgramPageSkeleton";

/**
 * Skeleton for private instruction pages.
 * Differs from ProgramPageSkeleton in two ways:
 *   1. Left sidebar shows a mini-calendar availability view (not an accordion)
 *   2. Main card has a pricing-package grid + scheduling step + checkout step
 */
export function PrivateInstructionSkeleton() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[min(100%,1760px)]">
      <div className={programPageGrid}>
        {/* Left: nav + availability calendar */}
        <div className="space-y-2 lg:col-span-3">
          {/* Program name heading + mobile toggle button */}
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="h-8 min-h-[2rem] w-full max-w-[min(100%,24rem)] flex-1 rounded bg-gray-300/70 animate-pulse motion-reduce:animate-none" />
            <div className="h-6 min-w-[90px] w-[90px] shrink-0 rounded bg-gray-300/70 animate-pulse motion-reduce:animate-none lg:hidden" />
          </div>

          <div className="hidden space-y-0 lg:block">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center bg-white px-4 py-3"
              >
                <Shimmer
                  className={cn(
                    "h-[1.125rem] min-h-[1.125rem] rounded",
                    "w-[90%]",
                  )}
                />
              </div>
            ))}
          </div>

          {/* Session Calendar skeleton — mini month calendars */}
          <div className="mt-6">
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              {/* Title */}
              <Shimmer className="mb-3 h-4 w-36 rounded" />

              {/* Mini calendar grid — 3 months across */}
              <div className="grid grid-cols-3 gap-2 md:grid-cols-2">
                {[1, 2, 3].map((m) => (
                  <div
                    key={m}
                    className="w-full overflow-hidden rounded-lg border border-gray-200"
                  >
                    {/* Month header */}
                    <div className="flex items-center justify-center bg-green-600/80 px-1 py-1">
                      <Shimmer className="h-3 w-10 rounded-sm bg-green-500/50" />
                    </div>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 bg-gray-100">
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <div
                          key={d}
                          className="flex aspect-square items-center justify-center border-b border-gray-200"
                        >
                          <Shimmer className="h-[6px] w-[6px] rounded-sm bg-muted/60" />
                        </div>
                      ))}
                    </div>
                    {/* Day cells — 5 rows of 7 */}
                    <div className="grid grid-cols-7 gap-px bg-gray-200 p-0.5">
                      {Array.from({ length: 35 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex aspect-square items-center justify-center bg-white"
                        >
                          {idx >= 2 && idx < 32 && (
                            <Shimmer
                              className={cn(
                                "h-[6px] w-[6px] rounded-sm",
                                // Simulate some green highlighted days
                                [5, 8, 12, 15, 19, 22, 26].includes(idx)
                                  ? "bg-green-400/60"
                                  : "bg-muted/40",
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Schedule summary */}
              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                {[1, 2].map((i) => (
                  <div key={i} className="border-l-2 border-green-300 py-0.5 pl-3">
                    <Shimmer className="mb-1 h-3.5 w-3/4 rounded" />
                    <Shimmer className="h-3 w-1/2 rounded bg-muted/60" />
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-3 flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-green-500/50" />
                <Shimmer className="h-3 w-20 rounded bg-muted/60" />
              </div>
            </div>

            <Shimmer className="mt-2 h-3 w-4/5 rounded px-1 bg-muted/50" />
          </div>
        </div>

        {/* Center: hero + description + pricing packages + scheduling */}
        <div className="min-w-0 lg:col-span-6">
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            {/* Image */}
            <div className="relative aspect-[3/2] max-h-[350px] w-full bg-muted/50">
              <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-muted/60" />
            </div>

            <div className="space-y-8 p-6 lg:p-8">
              {/* Title */}
              <Shimmer className="h-5 w-3/5 max-w-md rounded" />

              {/* Description */}
              <div className="space-y-4">
                <Shimmer className="h-3.5 w-full rounded" />
                <Shimmer className="h-3.5 w-full rounded" />
                <Shimmer className="h-3.5 w-[96%] rounded" />
              </div>
              <div className="space-y-4">
                <Shimmer className="h-3.5 w-full rounded" />
                <Shimmer className="h-3.5 w-5/6 rounded" />
              </div>

              {/* Step 1: Select Package */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100/80">
                    <Shimmer className="h-3.5 w-2.5 rounded-sm bg-green-300/60" />
                  </div>
                  <Shimmer className="h-5 w-32 rounded" />
                </div>

                {/* Package cards grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex min-h-[8rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-gray-100 bg-white p-2 shadow-sm"
                    >
                      <Shimmer className="h-3.5 w-16 rounded" />
                      <Shimmer className="h-7 w-14 rounded" />
                      <Shimmer className="h-3 w-20 rounded bg-muted/50" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2 + Step 3 side by side */}
              <div className="border-t border-gray-100 pt-8">
                <div className="flex flex-col gap-8 md:flex-row">
                  {/* Step 2: Schedule */}
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100/80">
                        <Shimmer className="h-3.5 w-2.5 rounded-sm bg-green-300/60" />
                      </div>
                      <Shimmer className="h-5 w-40 rounded" />
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
                      <Shimmer className="mb-2 h-4 w-48 rounded" />
                      <Shimmer className="mb-6 h-3 w-36 rounded bg-muted/50" />
                      <Shimmer className="h-14 w-full rounded-xl border-2 border-green-200/50 bg-white" />
                    </div>
                  </div>

                  {/* Step 3: Checkout */}
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100/80">
                        <Shimmer className="h-3.5 w-2.5 rounded-sm bg-green-300/60" />
                      </div>
                      <Shimmer className="h-5 w-24 rounded" />
                    </div>
                    <div className="space-y-3">
                      <Shimmer className="h-12 w-full rounded-xl" />
                      <Shimmer className="h-12 w-full rounded-xl bg-muted/60" />
                    </div>
                  </div>
                </div>

                {/* Call option */}
                <div className="mt-8 flex flex-col items-center border-t pt-6">
                  <Shimmer className="mb-3 h-3.5 w-6 rounded bg-muted/50" />
                  <Shimmer className="h-4 w-56 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: features + details */}
        <div className="min-w-0 space-y-7 lg:col-span-4">
          <div className="rounded-xl border border-border/60 bg-white p-8 shadow-sm sm:p-9">
            <Shimmer className="mb-7 h-8 w-[min(100%,22rem)] rounded" />
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <Shimmer className="h-5 w-5 shrink-0 rounded-full sm:h-6 sm:w-6" />
                  <Shimmer className="h-[1.125rem] min-h-[1.125rem] min-w-0 flex-1 rounded sm:h-5" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-white p-8 shadow-sm sm:p-9">
            <Shimmer className="mb-7 h-8 w-[min(100%,18rem)] rounded" />
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3.5">
                  <Shimmer className="mt-0.5 h-7 w-7 shrink-0 rounded" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <Shimmer className="h-5 w-[min(100%,14rem)] rounded" />
                    <Shimmer className="h-4 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
