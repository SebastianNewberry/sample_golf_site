"use client";

import { useState } from "react";
import Link from "next/link";
import { BeginnerSeriesClient } from "./BeginnerSeriesClient";
import { SessionCalendar } from "@/app/components/SessionCalendar";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

interface BeginnerSeriesPageClientProps {
  imageUrl?: string | undefined;
  defaultImage: any;
  title: string;
  description: string[];
  programId: string;
  programPrice: number;
  duration: string;
  sessions: ProgramSession[];
  currentPage?: string;
  features: string[] | null;
  details: string | any[] | null;
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
}: BeginnerSeriesPageClientProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  // Get selected session's schedule
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const schedule = selectedSession?.schedule
    ? parseSchedule(selectedSession.schedule)
    : null;

  const sessionsList = sessions.map((s) => ({ id: s.id, name: s.name }));

  return (
    <>
      {/* Left Sidebar - Program Links + Calendar */}
      <div className="lg:col-span-3 space-y-2">
        {/* Header with program name */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Junior Beginner Series
        </h1>

        {/* Navigation Links */}
        <Link
          href="/junior-programs/beginner-series"
          className={`block px-4 py-3 text-sm ${
            currentPage === "beginner-series"
              ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
              : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          JUNIOR BEGINNER SERIES
        </Link>
        <Link
          href="/junior-programs/developmental-series"
          className={`block px-4 py-3 text-sm ${
            currentPage === "developmental-series"
              ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
              : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          JUNIOR DEVELOPMENTAL SERIES
        </Link>
        <Link
          href="/junior-programs/golf-camp"
          className={`block px-4 py-3 text-sm ${
            currentPage === "golf-camp"
              ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
              : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          JUNIOR GOLF CAMP
        </Link>
        <Link
          href="/junior-programs/developmental-camp"
          className={`block px-4 py-3 text-sm ${
            currentPage === "developmental-camp"
              ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
              : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          JUNIOR DEVELOPMENTAL GOLF CAMP
        </Link>
        <Link
          href="/junior-programs/private-instruction"
          className={`block px-4 py-3 text-sm ${
            currentPage === "private-instruction"
              ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
              : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          JUNIOR PRIVATE GOLF INSTRUCTION
        </Link>

        {/* Session Calendar - below navigation links */}
        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Session Calendar
          </h2>
          <SessionCalendar schedule={schedule} />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-6">
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
          onSessionChange={setSelectedSessionId}
        />
      </div>

      {/* Right: Features & Details */}
      <div className="lg:col-span-4 space-y-6">
        <ProgramFeaturesAndDetails
          features={features}
          details={details}
        />
      </div>
    </>
  );
}

