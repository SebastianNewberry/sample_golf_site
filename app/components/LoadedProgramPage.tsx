"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import { ProgramPageSkeleton } from "@/app/components/ProgramPageSkeleton";
import { useProgramCatalog } from "@/app/components/ProgramCatalogContext";
import {
  programPageContent,
  programPageGrid,
  programPageReveal,
} from "@/app/components/program-page-layout";
import type {
  ProgramCatalogRecord,
  ProgramCatalogSession,
  ProgramCatalogSlotEnrollment,
} from "@/lib/program-catalog-data";
import type { Program } from "@/db/schema";

function subscribeToUrl() {
  return () => {};
}

function readSessionId(): string | undefined {
  const value = new URLSearchParams(window.location.search).get("sessionId");
  return value ?? undefined;
}

function useSessionIdFromUrl(): string | undefined {
  return useSyncExternalStore(subscribeToUrl, readSessionId, () => undefined);
}

export type LoadedProgramRenderArgs = {
  program: Program;
  sessions: ProgramCatalogSession[];
  slotEnrollment: Record<string, ProgramCatalogSlotEnrollment[]>;
  pricingOptions: unknown[];
  sessionId: string | undefined;
};

export function LoadedProgramPage({
  programId,
  variant,
  tallImage = false,
  missingTitle,
  missingName,
  children,
}: {
  programId: string;
  variant: "adult" | "junior";
  tallImage?: boolean;
  missingTitle: string;
  missingName: string;
  children: (program: LoadedProgramRenderArgs) => ReactNode;
}) {
  const { status, error, getProgram, ensureLoaded } = useProgramCatalog();
  const sessionId = useSessionIdFromUrl();
  const revealOnReady = useRef(status !== "ready");

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  if (status === "error") {
    return (
      <div className={programPageContent}>
        <p className="py-16 text-center text-sm text-red-600">
          {error ?? "Could not load programs."}{" "}
          <button type="button" className="underline" onClick={ensureLoaded}>
            Try again
          </button>
        </p>
      </div>
    );
  }

  if (status !== "ready") {
    return <ProgramPageSkeleton variant={variant} tallImage={tallImage} />;
  }

  const record: ProgramCatalogRecord | null = getProgram(programId);
  const contentClassName = revealOnReady.current
    ? programPageReveal
    : programPageContent;

  return (
    <div className={contentClassName}>
      <div className={programPageGrid}>
        {record ? (
          children({
            program: record.program,
            sessions: record.sessions,
            slotEnrollment: record.slotEnrollment,
            pricingOptions: record.pricingOptions,
            sessionId,
          })
        ) : (
          <>
            <div className="lg:col-span-3 space-y-2">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {missingTitle}
              </h1>
            </div>
            <div className="lg:col-span-7">
              <ProgramComingSoonCard programName={missingName} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
