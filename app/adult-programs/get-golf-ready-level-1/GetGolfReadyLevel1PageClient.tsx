"use client";
import { ContentFadeIn } from "@/app/components/ContentFadeIn";

import { programPageClientGrid } from "@/app/components/program-page-layout";
import { GetGolfReadyLevel1Client } from "./GetGolfReadyLevel1Client";
import { AdultProgramPageWrapper } from "@/app/components/AdultProgramPageWrapper";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

interface GetGolfReadyLevel1PageClientProps {
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

export function GetGolfReadyLevel1PageClient({
  imageUrl,
  defaultImage,
  title,
  description,
  programId,
  programPrice,
  duration,
  sessions,
  currentPage = "get-golf-ready-level-1",
  features,
  details,
  initialSessionId,
}: GetGolfReadyLevel1PageClientProps) {
  return (
    <div className={programPageClientGrid}>
      <AdultProgramPageWrapper
        programName="Get Golf Ready Level I"
        currentPage="get-golf-ready-level-1"
        sessions={sessions}
        initialSessionId={initialSessionId}
      >
        {({ selectedSessionId, onSessionChange }) => (
          <GetGolfReadyLevel1Client
            imageUrl={imageUrl}
            defaultImage={defaultImage}
            title={title}
            description={description}
            programId={programId}
            programPrice={programPrice}
            duration={duration}
            sessions={sessions.map((s) => {
              const schedule = s.schedule ? parseSchedule(s.schedule) : null;
              const startDate =
                schedule && schedule.length > 0 ? schedule[0].date : undefined;
              return {
                id: s.id,
                name: s.name,
                startDate,
                isBooked: (s as any).isBooked,
              };
            })}
            selectedSessionId={selectedSessionId}
            onSessionChange={onSessionChange}
          />
        )}
      </AdultProgramPageWrapper>

      {/* Right: Features & Details */}
      <ContentFadeIn className="lg:col-span-4 space-y-6">
        <ProgramFeaturesAndDetails features={features} details={details} />
      </ContentFadeIn>
    </div>
  );
}
