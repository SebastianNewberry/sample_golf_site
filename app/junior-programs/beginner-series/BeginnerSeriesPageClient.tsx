"use client";
import { motion } from "motion/react";

import { BeginnerSeriesClient } from "./BeginnerSeriesClient";
import { JuniorProgramPageWrapper } from "@/app/components/JuniorProgramPageWrapper";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

interface BeginnerSeriesPageClientProps {
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

export function BeginnerSeriesPageClient({
  imageUrl,
  defaultImage,
  title,
  description,
  programId,
  programPrice,
  duration,
  sessions,
  currentPage = "beginner-series",
  features,
  details,
  initialSessionId,
}: BeginnerSeriesPageClientProps) {
  const sessionsList = sessions.map((s) => {
    const schedule = s.schedule ? parseSchedule(s.schedule) : null;
    const startDate =
      schedule && schedule.length > 0 ? schedule[0].date : undefined;
    return { id: s.id, name: s.name, startDate, isBooked: (s as any).isBooked };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="lg:col-span-13 grid lg:grid-cols-13 gap-6"
    >
      <JuniorProgramPageWrapper
        programName="Junior Beginner Series"
        currentPage="beginner-series"
        sessions={sessions}
        initialSessionId={initialSessionId}
      >
        {({ selectedSessionId, onSessionChange }) => (
          <BeginnerSeriesClient
            imageUrl={imageUrl}
            defaultImage={defaultImage}
            title={title}
            description={description}
            programId={programId}
            programPrice={programPrice}
            duration={duration}
            sessions={sessionsList}
            selectedSessionId={selectedSessionId}
            onSessionChange={onSessionChange}
          />
        )}
      </JuniorProgramPageWrapper>

      {/* Right: Features & Details */}
      <div className="lg:col-span-4 space-y-6">
        <ProgramFeaturesAndDetails features={features} details={details} />
      </div>
    </motion.div>
  );
}
