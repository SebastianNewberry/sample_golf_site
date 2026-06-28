"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { programPageClientGrid } from "@/app/components/program-page-layout";
import { DevelopmentalSeriesCard } from "@/app/components/DevelopmentalSeriesCard";
import { JuniorProgramPageWrapper } from "@/app/components/JuniorProgramPageWrapper";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { ProgramSession } from "@/db/schema";

interface DevelopmentalSeriesPageWrapperProps {
  programId: string;
  programName: string;
  programPrice: number;
  duration: string;
  sessions: ProgramSession[];
  features: string[] | null;
  details: string | any[] | null;
  initialSessionId?: string;
}

export function DevelopmentalSeriesPageWrapper({
  programId,
  programName,
  programPrice,
  duration,
  sessions,
  features,
  details,
  initialSessionId,
}: DevelopmentalSeriesPageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={programPageClientGrid}
    >
      <JuniorProgramPageWrapper
        programName="Junior Developmental Series"
        currentPage="developmental-series"
        sessions={sessions}
        initialSessionId={initialSessionId}
      >
        {({ selectedSessionId, onSessionChange }) => (
          <DevelopmentalSeriesCard
            programId={programId}
            programName={programName}
            programPrice={programPrice}
            duration={duration}
            sessions={sessions}
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
