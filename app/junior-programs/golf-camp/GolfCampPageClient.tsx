"use client";
import { motion } from "motion/react";

import { programPageClientGrid } from "@/app/components/program-page-layout";

import { GolfCampClient } from "./GolfCampClient";
import { JuniorProgramPageWrapper } from "@/app/components/JuniorProgramPageWrapper";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

interface GolfCampPageClientProps {
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

export function GolfCampPageClient({
  imageUrl,
  defaultImage,
  title,
  description,
  programId,
  programPrice,
  duration,
  sessions,
  currentPage = "golf-camp",
  features,
  details,
  initialSessionId,
}: GolfCampPageClientProps) {
  // The following state and calculations are now handled by JuniorProgramPageWrapper
  // const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  // const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  // const schedule = selectedSession?.schedule
  //   ? parseSchedule(selectedSession.schedule)
  //   : null;
  // const sessionsList = sessions.map((s) => ({ id: s.id, name: s.name }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={programPageClientGrid}
    >
      <JuniorProgramPageWrapper
        programName="Junior Golf Camp"
        currentPage="golf-camp"
        sessions={sessions}
        initialSessionId={initialSessionId}
      >
        {({ selectedSessionId, onSessionChange }) => (
          <GolfCampClient
            imageUrl={imageUrl}
            defaultImage={defaultImage}
            title={title}
            description={description}
            programId={programId}
            programPrice={programPrice}
            duration={duration}
            sessions={sessions.map((s) => ({ id: s.id, name: s.name }))} // Pass simplified sessions list to GolfCampClient
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
