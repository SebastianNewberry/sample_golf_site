"use client";

import { useState } from "react";
import Link from "next/link";
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
    <>
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
      <div className="lg:col-span-4 space-y-6">
        <ProgramFeaturesAndDetails features={features} details={details} />
      </div>
    </>
  );
}
