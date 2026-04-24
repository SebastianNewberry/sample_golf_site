import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Matches program pages: 3 + 6 + 4 columns on large screens */
export const programPageGrid =
  "grid grid-cols-1 gap-7 lg:grid-cols-[repeat(13,minmax(0,1fr))] lg:gap-9";

export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/90 animate-pulse motion-reduce:animate-none",
        className,
      )}
    />
  );
}

export function ProgramPageSkeleton() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[min(100%,1760px)]">
      <div className={programPageGrid}>
        {/* Left: nav + session card */}
        <div className="space-y-2 lg:col-span-3">
          {/* Program name heading + mobile toggle button */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 min-h-[2rem] w-full max-w-[min(100%,24rem)] flex-1 rounded bg-gray-300/70 animate-pulse motion-reduce:animate-none" />
            <div className="h-6 min-w-[90px] w-[90px] shrink-0 rounded bg-gray-300/70 animate-pulse motion-reduce:animate-none lg:hidden" />
          </div>

          <div className="hidden space-y-0 lg:block">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center bg-white px-4 py-3">
                <Shimmer
                  className={cn(
                    "h-[1.125rem] min-h-[1.125rem] rounded",
                    "w-[90%]",
                  )}
                />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="py-5">
                <Shimmer className="h-6 w-48 rounded" />
              </CardHeader>
              <CardContent className="p-0">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <Shimmer className="h-[1.125rem] min-h-[1.125rem] min-w-0 flex-1 rounded" />
                    <Shimmer className="h-4 w-4 shrink-0 rounded-sm" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Center: hero + copy + purchase */}
        <div className="min-w-0 lg:col-span-6">
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="relative aspect-[3/2] min-h-[300px] max-h-[440px] w-full bg-muted/50">
              <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-muted/60" />
            </div>

            <div className="space-y-7 p-7 sm:p-8">
              <Shimmer className="h-6 w-[min(100%,28rem)] max-w-full rounded" />

              <div className="space-y-3">
                <Shimmer className="h-4 w-full rounded" />
                <Shimmer className="h-4 w-full rounded" />
                <Shimmer className="h-4 w-[96%] rounded" />
                <Shimmer className="h-4 w-full rounded" />
                <Shimmer className="h-4 w-[88%] rounded" />
              </div>

              <div className="space-y-3">
                <Shimmer className="h-4 w-full rounded" />
                <Shimmer className="h-4 w-[82%] rounded" />
              </div>

              <div className="flex flex-col items-center border-t border-border/60 py-7">
                <Shimmer className="mb-2.5 h-11 w-48 rounded-md" />
                <Shimmer className="h-4 w-56 rounded" />
              </div>

              <div className="space-y-3.5 pt-1">
                <Shimmer className="h-5 w-36 rounded" />
                <Shimmer className="h-12 w-full rounded-md border border-border/50 bg-muted/20" />
              </div>

              <div className="space-y-3.5 pt-2">
                <Shimmer className="h-14 w-full rounded-lg" />
                <Shimmer className="h-14 w-full rounded-lg bg-muted/70" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: features + details */}
        <div className="min-w-0 space-y-7 lg:col-span-4">
          <div className="rounded-xl border border-border/60 bg-white p-8 shadow-sm sm:p-9">
            <Shimmer className="mb-7 h-8 w-[min(100%,18rem)] rounded" />
            <div className="space-y-5">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <Shimmer className="h-5 w-5 shrink-0 rounded-full sm:h-6 sm:w-6" />
                  <Shimmer className="h-[1.125rem] min-h-[1.125rem] min-w-0 flex-1 rounded sm:h-5" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-white p-8 shadow-sm sm:p-9">
            <Shimmer className="mb-7 h-8 w-[min(100%,15rem)] rounded" />
            <div className="space-y-7">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3.5">
                  <Shimmer className="mt-0.5 h-7 w-7 shrink-0 rounded" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Shimmer className="h-5 w-[min(100%,11rem)] rounded" />
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
