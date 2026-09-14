"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Shimmer } from "@/app/components/Shimmer";
import { ContentFadeIn } from "@/app/components/ContentFadeIn";
import { ProgramSidebarHeader } from "@/app/components/ProgramSidebarHeader";
import { ProgramSidebarNav } from "@/app/components/ProgramSidebarNav";
import { SessionSchedulePanel } from "@/app/components/SessionSchedulePanel";
import {
  programCardImageContainer,
  programCardImageFrame,
  programCardImageFrameTall,
  programPageContent,
  programPageGrid,
} from "@/app/components/program-page-layout";
import {
  getProgramPageTitle,
  type ProgramNavVariant,
} from "@/lib/program-nav-links";
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
            <div key={i} className="border-l-2 border-green-300 py-0.5 pl-3">
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
      <Shimmer className="mt-2 h-3 w-full rounded" />
    </div>
  );
}

/** Visible session schedule card — real title, shimmered session rows. */
function SessionScheduleCard() {
  return (
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
  const pathname = usePathname();
  const title = getProgramPageTitle(pathname, variant);

  return (
    <div key={pathname ?? "program-skeleton"} className={programPageContent}>
      <div className={programPageGrid}>
        {/* Left: nav + session area — no fade so route swaps are seamless */}
        <div className="space-y-2 lg:col-span-3">
          {title && (
            <ProgramSidebarHeader
              title={title}
              showNav={showMobileNav}
              interactive={false}
            />
          )}

          <ProgramSidebarNav variant={variant} mode="desktop" />
          {showMobileNav && (
            <div className="lg:hidden mb-2">
              <ProgramSidebarNav variant={variant} mode="mobile" />
            </div>
          )}

          <SessionScheduleCard />
          <InvisibleCalendarSpacer />
        </div>

        {/* Center: ProgramCard — shell stays put; only shimmers fade */}
        <div className="min-w-0 lg:col-span-6">
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            <div className={programCardImageContainer}>
              <div className={`${imageFrame} bg-gray-200`}>
                <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-muted/60" />
              </div>
            </div>

            <div className="space-y-6 p-6">
              {title ? (
                <h1 className="text-lg font-bold text-gray-900 mb-2">{title}</h1>
              ) : null}

              <ContentFadeIn>
                {/* Description — matches ProgramCard `text-sm leading-relaxed` */}
                <div className="mb-6 space-y-3">
                  <Shimmer className="h-3.5 w-full rounded" />
                  <Shimmer className="h-3.5 w-[96%] rounded" />
                  <Shimmer className="h-3.5 w-[88%] rounded" />
                  <Shimmer className="h-3.5 w-[72%] rounded" />
                </div>

                <div className="mb-4 flex flex-col items-center border-b border-gray-100 pb-4 text-center">
                  <Shimmer className="mb-1 h-12 w-40 rounded-md" />
                  <Shimmer className="h-3.5 w-28 rounded" />
                </div>

                <div className="mb-5 flex items-start gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Shimmer className="h-3.5 w-28 rounded" />
                    <Shimmer className="h-9 w-full rounded-md border border-gray-200/50" />
                  </div>
                  <div className="w-24 shrink-0 space-y-2">
                    <Shimmer className="h-3.5 w-16 rounded" />
                    <Shimmer className="h-9 w-full rounded-md border border-gray-200/50" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Shimmer className="h-12 w-full rounded-xl" />
                  <Shimmer className="h-12 w-full rounded-xl" />
                </div>
              </ContentFadeIn>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="min-w-0 space-y-6 lg:col-span-4">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              Program Features
            </h2>
            <ContentFadeIn>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Shimmer className="h-5 w-5 shrink-0 rounded-full" />
                    <Shimmer className="h-4 min-w-0 flex-1 rounded" />
                  </div>
                ))}
              </div>
            </ContentFadeIn>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              Program Details
            </h2>
            <ContentFadeIn>
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
            </ContentFadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
