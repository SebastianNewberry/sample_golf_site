"use client";

import { useState, ReactNode, ReactElement, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

interface AdultProgramPageWrapperProps {
  programName: string;
  currentPage: string;
  sessions: ProgramSession[];
  children: ReactNode | ((props: RenderProps) => ReactElement);
}

export function AdultProgramPageWrapper({
  programName,
  currentPage,
  sessions,
  children,
}: AdultProgramPageWrapperProps) {
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessionIdParam || "",
  );

  // Update selected session if URL param changes
  useEffect(() => {
    if (sessionIdParam) {
      setSelectedSessionId(sessionIdParam);
    }
  }, [sessionIdParam]);

  // Get selected session's schedule
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const schedule = selectedSession?.schedule
    ? parseSchedule(selectedSession.schedule)
    : null;

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
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Available Sessions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion
                type="single"
                collapsible
                value={selectedSessionId}
                onValueChange={setSelectedSessionId}
                className="w-full"
              >
                {sessions.map((session) => (
                  <AccordionItem
                    key={session.id}
                    value={session.id}
                    className="border-b last:border-0 px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-3">
                      <span className="font-medium text-sm">
                        {session.name ? session.name : "Session Details"}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <SessionCalendar
                        schedule={
                          session.schedule
                            ? parseSchedule(session.schedule)
                            : null
                        }
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-6">
        {isRenderFunction
          ? (children as (props: RenderProps) => ReactElement)({
              selectedSessionId,
              onSessionChange: setSelectedSessionId,
            })
          : children}
      </div>
    </>
  );
}
