"use client";
import { motion } from "motion/react";

import { OpenPracticeClient } from "./OpenPracticeClient";
import { AdultProgramPageWrapper } from "@/app/components/AdultProgramPageWrapper";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

interface OpenPracticePageClientProps {
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

export function OpenPracticePageClient({
  imageUrl,
  defaultImage,
  title,
  description,
  programId,
  programPrice,
  duration,
  sessions,
  currentPage = "open-practice",
  features,
  details,
  initialSessionId,
}: OpenPracticePageClientProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="lg:col-span-13 grid lg:grid-cols-13 gap-6"
    >
      <AdultProgramPageWrapper
        programName="Adult Open Practice"
        currentPage="open-practice"
        sessions={sessions}
        initialSessionId={initialSessionId}
      >
        {({ selectedSessionId, onSessionChange }) => (
          <OpenPracticeClient
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
