"use client";
import { ContentFadeIn } from "@/app/components/ContentFadeIn";

import { programPageClientGrid } from "@/app/components/program-page-layout";
import { DevelopmentalCampClient } from "./DevelopmentalCampClient";
import { JuniorProgramPageWrapper } from "@/app/components/JuniorProgramPageWrapper";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

interface DevelopmentalCampPageClientProps {
  imageUrl?: string | undefined;
  defaultImage: any;
  title: string;
  description: string;
  programId: string;
  programPrice: number;
  duration: string;
  sessions: ProgramSession[];
  currentPage?: string;
  features: string[] | null;
  details: string | any[] | null;
  initialSessionId?: string;
}

export function DevelopmentalCampPageClient({
  imageUrl,
  defaultImage,
  title,
  description,
  programId,
  programPrice,
  duration,
  sessions,
  currentPage = "developmental-camp",
  features,
  details,
  initialSessionId,
}: DevelopmentalCampPageClientProps) {
  return (
    <div className={programPageClientGrid}>
      <JuniorProgramPageWrapper
        programName="Junior Developmental Golf Camp"
        currentPage="developmental-camp"
        sessions={sessions}
        initialSessionId={initialSessionId}
      >
        {({ selectedSessionId, onSessionChange }) => (
          <DevelopmentalCampClient
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
      </JuniorProgramPageWrapper>

      {/* Right: Features & Details */}
      <ContentFadeIn className="lg:col-span-4 space-y-6">
        <ProgramFeaturesAndDetails features={features} details={details} />
      </ContentFadeIn>
    </div>
  );
}
