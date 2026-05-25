"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="lg:col-span-13 grid lg:grid-cols-13 gap-6"
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
