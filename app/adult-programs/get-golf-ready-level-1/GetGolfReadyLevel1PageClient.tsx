"use client";

import { useState } from "react";
import Link from "next/link";
import { GetGolfReadyLevel1Client } from "./GetGolfReadyLevel1Client";
import { SessionCalendar } from "@/app/components/SessionCalendar";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

interface GetGolfReadyLevel1PageClientProps {
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

export function GetGolfReadyLevel1PageClient({
  imageUrl,
  defaultImage,
  title,
  description,
  programId,
  programPrice,
  duration,
  sessions,
  currentPage = "get-golf-ready-level-1",
  features,
  details,
}: GetGolfReadyLevel1PageClientProps) {
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
          Get Golf Ready Level I
        </h1>

        {/* Navigation Links */}
        <Link
          href="/adult-programs/get-golf-ready-level-1"
          className={`block px-4 py-3 text-sm ${
            currentPage === "get-golf-ready-level-1"
              ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
              : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          GET GOLF READY (LEVEL I)
        </Link>
        <Link
          href="/adult-programs/get-golf-ready-level-2"
          className={`block px-4 py-3 text-sm ${
            currentPage === "get-golf-ready-level-2"
              ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
              : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          GET GOLF READY (LEVEL II)
        </Link>
        <Link
          href="/adult-programs/short-game"
          className={`block px-4 py-3 text-sm ${
            currentPage === "short-game"
              ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
              : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          ADULT SHORT GAME SERIES
        </Link>
        <Link
          href="/adult-programs/women"
          className={`block px-4 py-3 text-sm ${
            currentPage === "women"
              ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
              : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          GOLF FOR WOMEN
        </Link>
        <Link
          href="/adult-programs/private"
          className={`block px-4 py-3 text-sm ${
            currentPage === "private"
              ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
              : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          ADULT PRIVATE GOLF INSTRUCTION
        </Link>
        <Link
          href="/adult-programs/open-practice"
          className={`block px-4 py-3 text-sm ${
            currentPage === "open-practice"
              ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
              : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          ADULT OPEN PRACTICE
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
        <GetGolfReadyLevel1Client
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

