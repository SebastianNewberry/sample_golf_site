"use client";

import { useState, ReactNode, ReactElement } from "react";
import Link from "next/link";
import { SessionCalendar } from "@/app/components/SessionCalendar";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

type RenderProps = {
  selectedSessionId: string;
  onSessionChange: (id: string) => void;
};

interface JuniorProgramPageWrapperProps {
  programName: string;
  currentPage: string;
  sessions: ProgramSession[];
  children: ReactNode | ((props: RenderProps) => ReactElement);
}

export function JuniorProgramPageWrapper({
  programName,
  currentPage,
  sessions,
  children,
}: JuniorProgramPageWrapperProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  // Get selected session's schedule
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const schedule = selectedSession?.schedule
    ? parseSchedule(selectedSession.schedule)
    : null;

  // Check if children is a function (render prop)
  const isRenderFunction = typeof children === 'function';

  return (
    <>
      {/* Left Sidebar - Program Links + Calendar */}
      <div className="lg:col-span-3 space-y-2">
        {/* Header with program name */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {programName}
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
        {isRenderFunction ? (
          (children as (props: RenderProps) => ReactElement)({
            selectedSessionId,
            onSessionChange: setSelectedSessionId,
          })
        ) : children}
      </div>
    </>
  );
}
