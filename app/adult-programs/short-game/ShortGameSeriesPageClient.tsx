"use client";

import { useState } from "react";
import Link from "next/link";
import { ShortGameSeriesClient } from "./ShortGameSeriesClient";
import { AdultProgramPageWrapper } from "@/app/components/AdultProgramPageWrapper";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

interface ShortGameSeriesPageClientProps {
  imageUrl?: string | undefined;
  defaultImage: any;
  title: string;
  description: string[];
  programId: string;
  programPrice: number;
  duration: string;
  sessions: ProgramSession[];
  currentPage?: string;
  features: string[] | null;
  details: string | any[] | null;
}

export function ShortGameSeriesPageClient({
  imageUrl,
  defaultImage,
  title,
  description,
  programId,
  programPrice,
  duration,
  sessions,
  currentPage = "short-game",
  features,
  details,
}: ShortGameSeriesPageClientProps) {
  return (
    <>
      <AdultProgramPageWrapper
        programName="Adult Short Game Series"
        currentPage="short-game"
        sessions={sessions}
      >
        {({ selectedSessionId, onSessionChange }) => (
          <ShortGameSeriesClient
            imageUrl={imageUrl}
            defaultImage={defaultImage}
            title={title}
            description={description}
            programId={programId}
            programPrice={programPrice}
            duration={duration}
            sessions={sessions.map((s) => ({ id: s.id, name: s.name }))}
            selectedSessionId={selectedSessionId}
            onSessionChange={onSessionChange}
          />
        )}
      </AdultProgramPageWrapper>

      {/* Right: Features & Details */}
      <div className="lg:col-span-4 space-y-6">
        <ProgramFeaturesAndDetails features={features} details={details} />
      </div>
    </>
  );
}
