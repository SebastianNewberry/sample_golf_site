"use client";

import { useState } from "react";
import Link from "next/link";
import { GetGolfReadyLevel2Client } from "./GetGolfReadyLevel2Client";
import { AdultProgramPageWrapper } from "@/app/components/AdultProgramPageWrapper";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

interface GetGolfReadyLevel2PageClientProps {
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

export function GetGolfReadyLevel2PageClient({
  imageUrl,
  defaultImage,
  title,
  description,
  programId,
  programPrice,
  duration,
  sessions,
  currentPage = "get-golf-ready-level-2",
  features,
  details,
  initialSessionId,
}: GetGolfReadyLevel2PageClientProps) {
  return (
    <>
      <AdultProgramPageWrapper
        programName="Get Golf Ready Level II"
        currentPage="get-golf-ready-level-2"
        sessions={sessions}
        initialSessionId={initialSessionId}
      >
        {({ selectedSessionId, onSessionChange }) => (
          <GetGolfReadyLevel2Client
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
      <div className="lg:col-span-4 space-y-6">
        <ProgramFeaturesAndDetails features={features} details={details} />
      </div>
    </>
  );
}
