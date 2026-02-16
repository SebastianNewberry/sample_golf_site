"use client";

import { useState, ReactNode, ReactElement, useEffect } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  initialSessionId?: string | undefined;
}

export function JuniorProgramPageWrapper({
  programName,
  currentPage,
  sessions,
  children,
  initialSessionId,
}: JuniorProgramPageWrapperProps) {
  // Separate state for Accordion expansion and Purchase selection
  const [expandedSessionId, setExpandedSessionId] = useState<string>(
    initialSessionId || "",
  );
  const [purchaseSessionId, setPurchaseSessionId] = useState<string>(
    initialSessionId || "",
  );

  // Initialize checks on mount/updates if initialSessionId is provided
  useEffect(() => {
    if (initialSessionId) {
      const session = sessions.find((s) => s.id === initialSessionId);
      if (session) {
        const schedule = session.schedule
          ? parseSchedule(session.schedule)
          : null;
        const startDate =
          schedule && schedule.length > 0 ? new Date(schedule[0].date) : null;
        const isStarted = startDate ? new Date() > startDate : false;

        if (isStarted) {
          setPurchaseSessionId(""); // Don't select if started
        }
      }
    }
  }, [initialSessionId, sessions]);

  const handleAccordionChange = (val: string) => {
    setExpandedSessionId(val);

    // If expanding a section (val is not empty)
    if (val) {
      const session = sessions.find((s) => s.id === val);
      if (session) {
        const schedule = session.schedule
          ? parseSchedule(session.schedule)
          : null;
        const startDate =
          schedule && schedule.length > 0 ? new Date(schedule[0].date) : null;
        const isStarted = startDate ? new Date() > startDate : false;

        if (!isStarted) {
          setPurchaseSessionId(val);
        } else {
          // If started, do not select for purchase
          setPurchaseSessionId("");
        }
      }
    }
  };

  const handlePurchaseChange = (val: string) => {
    setPurchaseSessionId(val);
    setExpandedSessionId(val); // Sync accordion expansion
  };

  // Check if children is a function (render prop)
  const isRenderFunction = typeof children === "function";

  return (
    <>
      {/* Left Sidebar - Program Links + Calendar */}
      <div className="lg:col-span-3 space-y-2">
        {/* Header with program name */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{programName}</h1>

        {/* Navigation Links */}
        <Link
          href="/junior-programs/beginner-series"
          className={`block px-4 py-3 text-sm ${currentPage === "beginner-series"
            ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
            : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
            }`}
        >
          JUNIOR BEGINNER SERIES
        </Link>
        <Link
          href="/junior-programs/developmental-series"
          className={`block px-4 py-3 text-sm ${currentPage === "developmental-series"
            ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
            : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
            }`}
        >
          JUNIOR DEVELOPMENTAL SERIES
        </Link>
        <Link
          href="/junior-programs/private-instruction"
          className={`block px-4 py-3 text-sm ${currentPage === "private-instruction"
            ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
            : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
            }`}
        >
          JUNIOR PRIVATE GOLF INSTRUCTION
        </Link>

        {/* Session Calendar - below navigation links */}
        <div className="mt-6">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Available Sessions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sessions.length > 0 ? (
                <Accordion
                  type="single"
                  collapsible
                  value={expandedSessionId}
                  onValueChange={handleAccordionChange}
                  className="w-full"
                >
                  {sessions.map((session) => {
                    const schedule = session.schedule ? parseSchedule(session.schedule) : null;
                    const startDate = schedule && schedule.length > 0 ? new Date(schedule[0].date) : null;
                    const isStarted = startDate ? new Date() > startDate : false;

                    return (
                      <AccordionItem
                        key={session.id}
                        value={session.id}
                        className="border-b last:border-0 px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-3">
                          <span className="font-medium text-sm">
                            {session.name ? session.name : "Session Details"}
                            {isStarted && <span className="text-red-600 ml-1">(Started)</span>}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <SessionCalendar
                            schedule={schedule}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm font-medium">
                  No Sessions Yet
                </div>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-red-500 mt-2 font-medium">
            * Call to inquire about past sessions that have already started
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-6">
        {isRenderFunction
          ? (children as (props: RenderProps) => ReactElement)({
            selectedSessionId: purchaseSessionId,
            onSessionChange: handlePurchaseChange,
          })
          : children}
      </div>
    </>
  );
}
