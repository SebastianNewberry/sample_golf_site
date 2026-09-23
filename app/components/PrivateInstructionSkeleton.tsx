"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Shimmer } from "@/app/components/Shimmer";
import { ProgramSidebarHeader } from "@/app/components/ProgramSidebarHeader";
import { ProgramSidebarNav } from "@/app/components/ProgramSidebarNav";
import { SessionSchedulePanel } from "@/app/components/SessionSchedulePanel";
import {
  programCardImageContainer,
  programCardImageFrameJuniorPrivate,
  programCardImageFrameTall,
  programPageContent,
  programPageGrid,
} from "@/app/components/program-page-layout";
import { getProgramPageTitle } from "@/lib/program-nav-links";
import { getProgramMobileNavOpen } from "@/lib/use-program-sidebar-nav";
import { ProgramSkeletonHandoff } from "@/app/components/ProgramSkeletonHandoff";

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
  const pathname = usePathname();
  const title = getProgramPageTitle(pathname, layout);

  return (
    <ProgramSkeletonHandoff>
    <div key={pathname ?? "private-skeleton"} className={programPageContent}>
      <div className={programPageGrid}>
        {/* Left: nav + SessionCalendar summary — no fade so route swaps are seamless */}
        <div className="space-y-2 lg:col-span-3">
          {title && (
            <ProgramSidebarHeader
              title={title}
              showNav={showMobileNav}
              interactive={false}
            />
          )}

          <ProgramSidebarNav variant={layout} mode="desktop" />
          {showMobileNav && (
            <div className="lg:hidden mb-2">
              <ProgramSidebarNav variant={layout} mode="mobile" />
            </div>
          )}

          <SessionSchedulePanel
              footnote={
                <Shimmer className="mt-2 h-3 w-full rounded" />
              }
            >
            <div className="relative overflow-visible p-3">

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
                          <Shimmer className="h-2 w-2 rounded-sm" />
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
                                  : "bg-gray-200",
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
                    <Shimmer className="h-3 w-4/5 rounded" />
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="h-4 w-4 shrink-0 rounded-sm bg-green-500/50" />
                <Shimmer className="h-3 w-24 rounded" />
              </div>
            </div>
            </SessionSchedulePanel>
        </div>

        {/* Center: hero + description + pricing + scheduling */}
        <div className={cn("min-w-0", spans.center)}>
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            <div className={programCardImageContainer}>
              <div className={`${imageFrame} bg-gray-200`}>
                <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-muted/60" />
              </div>
            </div>

            <div className="p-6 lg:p-8">
              {title ? (
                <h1 className="text-lg font-bold text-gray-900 mb-2">{title}</h1>
              ) : null}

                <div className="mb-8 space-y-4">
                  <div className="space-y-1">
                    <Shimmer className="h-3.5 w-full rounded" />
                    <Shimmer className="h-3.5 w-full rounded" />
                    <Shimmer className="h-3.5 w-[90%] rounded" />
                  </div>
                  <div className="space-y-1">
                    <Shimmer className="h-3.5 w-full rounded" />
                    <Shimmer className="h-3.5 w-4/5 rounded" />
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                      1
                    </span>
                    {layout === "adult"
                      ? "Select Package"
                      : "Select Private Instruction Package"}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex min-h-[8rem] flex-col items-center justify-center gap-1 rounded-xl border-2 border-gray-100 bg-white p-2 shadow-sm"
                      >
                        <Shimmer className="h-4 w-20 rounded" />
                        <Shimmer className="my-1 h-8 w-16 rounded" />
                        <Shimmer className="h-3 w-24 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-8">
                  <div className="flex flex-col items-start gap-8 md:flex-row">
                    <div className="w-full flex-1">
                      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                          2
                        </span>
                        Select Dates & Times
                      </h3>
                      <div className="flex h-full flex-col justify-center rounded-xl border border-gray-100 bg-gray-50 p-6">
                        <div className="mb-6 space-y-1">
                          <Shimmer className="h-3.5 w-44 rounded" />
                          <Shimmer className="h-3 w-36 rounded" />
                        </div>
                        <Shimmer className="h-14 w-full rounded-xl border-2 border-green-200/50 bg-white" />
                      </div>
                    </div>

                    <div className="w-full flex-1">
                      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                          3
                        </span>
                        Checkout
                      </h3>
                      <div className="space-y-3">
                        <Shimmer className="h-12 w-full rounded-xl" />
                        <Shimmer className="h-12 w-full rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right: features + details */}
        <div className={cn("min-w-0 space-y-6", spans.right)}>
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              Program Features
            </h2>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Shimmer className="h-5 w-5 shrink-0 rounded-full" />
                    <Shimmer className="h-4 min-w-0 flex-1 rounded" />
                  </div>
                ))}
              </div>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              Program Details
            </h2>
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 py-3">
                    <Shimmer className="mt-0.5 h-6 w-6 shrink-0 rounded" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <Shimmer className="h-4 w-36 rounded" />
                      <Shimmer className="h-3.5 w-full rounded" />
                      {i !== 2 && <Shimmer className="h-3.5 w-4/5 rounded" />}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </div>
    </div>
    </ProgramSkeletonHandoff>
  );
}
