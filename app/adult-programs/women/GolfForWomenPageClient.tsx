"use client";
import { motion } from "motion/react";

import { programPageClientGrid } from "@/app/components/program-page-layout";
import { GolfForWomenClient } from "./GolfForWomenClient";
import { AdultProgramPageWrapper } from "@/app/components/AdultProgramPageWrapper";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

interface GolfForWomenPageClientProps {
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

export function GolfForWomenPageClient({
  imageUrl,
  defaultImage,
  title,
  description,
  programId,
  programPrice,
  duration,
  sessions,
  currentPage = "women",
  features,
  details,
  initialSessionId,
}: GolfForWomenPageClientProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={programPageClientGrid}
    >
      <AdultProgramPageWrapper
        programName="Golf For Women"
        currentPage="women"
        sessions={sessions}
        initialSessionId={initialSessionId}
      >
        {({ selectedSessionId, onSessionChange }) => (
          <GolfForWomenClient
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
    </motion.div>
  );
}
