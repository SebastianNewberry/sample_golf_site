"use client";

import { useState } from "react";
import Link from "next/link";
import { DevelopmentalSeriesCard } from "@/app/components/DevelopmentalSeriesCard";
import { DevelopmentalSeriesCalendarSection } from "@/app/components/DevelopmentalSeriesCalendarSection";
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
}

export function DevelopmentalSeriesPageWrapper({
  programId,
  programName,
  programPrice,
  duration,
  sessions,
  features,
  details,
}: DevelopmentalSeriesPageWrapperProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  return (
    <>
      {/* Left Sidebar - Program Links + Calendar */}
      <div className="lg:col-span-3 space-y-2">
        {/* Header with program name */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Junior Developmental Series
        </h1>

        {/* Navigation Links */}
        <Link
          href="/junior-programs/beginner-series"
          className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          JUNIOR BEGINNER SERIES
        </Link>
        <Link
          href="/junior-programs/developmental-series"
          className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
        >
          JUNIOR DEVELOPMENTAL SERIES
        </Link>
        <Link
          href="/junior-programs/golf-camp"
          className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          JUNIOR GOLF CAMP
        </Link>
        <Link
          href="/junior-programs/developmental-camp"
          className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          JUNIOR DEVELOPMENTAL GOLF CAMP
        </Link>
        <Link
          href="/junior-programs/private-instruction"
          className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          JUNIOR PRIVATE GOLF INSTRUCTION
        </Link>

        {/* Session Calendar - below navigation links */}
        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Session Calendar
          </h2>
          <DevelopmentalSeriesCalendarSection
            sessions={sessions}
            selectedSessionId={selectedSessionId}
          />
        </div>
      </div>

      {/* Main Card: Image + Description + Price */}
      <div className="lg:col-span-6">
        <DevelopmentalSeriesCard
          programId={programId}
          programName={programName}
          programPrice={programPrice}
          duration={duration}
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSessionChange={setSelectedSessionId}
        />
      </div>

      {/* Right: Features & Details */}
      <div className="lg:col-span-4 space-y-6">
        <ProgramFeaturesAndDetails features={features} details={details} />
      </div>
    </>
  );
}
