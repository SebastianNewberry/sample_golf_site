"use client";

import { useState, ReactNode, ReactElement, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionCalendar } from "@/app/components/SessionCalendar";
import { parseSchedule } from "@/lib/session-schedule";
import { useProgramSidebarNav } from "@/lib/use-program-sidebar-nav";
import type { ProgramSession } from "@/db/schema";

type RenderProps = {
  selectedSessionId: string;
  onSessionChange: (id: string) => void;
};

type SessionWithEnrollment = ProgramSession & {
  isBooked?: boolean;
  spotsRemaining?: number;
};

interface AdultProgramPageWrapperProps {
  programName: string;
  currentPage: string;
  sessions: SessionWithEnrollment[];
  children: ReactNode | ((props: RenderProps) => ReactElement);
  initialSessionId?: string;
}

export function AdultProgramPageWrapper({
  programName,
  currentPage,
  sessions,
  children,
  initialSessionId,
}: AdultProgramPageWrapperProps) {
  // Separate state for Accordion expansion and Purchase selection
  const [expandedSessionId, setExpandedSessionId] = useState<string>(
    initialSessionId || "",
  );
  const [purchaseSessionId, setPurchaseSessionId] = useState<string>(
    initialSessionId || "",
  );
  const { showNav, toggleNav, closeNav } = useProgramSidebarNav();

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
        const isUnavailable = isStarted || (session.isBooked ?? false);

        if (isUnavailable) {
          setPurchaseSessionId(""); // Don't select if unavailable
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
        const isUnavailable = isStarted || (session.isBooked ?? false);

        if (!isUnavailable) {
          setPurchaseSessionId(val);
        }
        // Unavailable sessions: expand schedule only — keep current purchase selection
      }
    }
  };

  const handlePurchaseChange = (val: string) => {
    setPurchaseSessionId(val);
    setExpandedSessionId(val); // Sync accordion expansion
  };

  const isRenderFunction = typeof children === "function";

  const isSessionUnavailable = (session: SessionWithEnrollment) => {
    const schedule = session.schedule ? parseSchedule(session.schedule) : null;
    const startDate = schedule && schedule.length > 0 ? new Date(schedule[0].date) : null;
    const isStarted = startDate ? new Date() > startDate : false;
    return isStarted || (session.isBooked ?? false);
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    const aUnavailable = isSessionUnavailable(a);
    const bUnavailable = isSessionUnavailable(b);
    if (aUnavailable === bUnavailable) return 0;
    return aUnavailable ? 1 : -1;
  });

  return (
    <>
      {/* Left Sidebar - Program Links + Calendar */}
      <div className="lg:col-span-3 space-y-2">
        {/* Header with program name */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{programName}</h1>
          <button
            onClick={toggleNav}
            className="lg:hidden flex items-center self-center gap-0.5 text-[8px] font-semibold text-gray-500 hover:text-gray-700 transition-colors px-1.5 py-0.5 rounded-md hover:bg-gray-100 cursor-pointer whitespace-nowrap min-w-[90px] justify-center"
          >
            {showNav ? "Hide Programs" : "Show Programs"}
            {showNav ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Navigation Links - Always visible on desktop, toggleable on mobile */}
        <div className="hidden lg:block space-y-0">
          <Link
            href="/adult-programs/get-golf-ready-level-1"
            className={`block px-4 py-3 text-sm ${currentPage === "get-golf-ready-level-1"
                ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
              }`}
          >
            GET GOLF READY (LEVEL I)
          </Link>
          <Link
            href="/adult-programs/get-golf-ready-level-2"
            className={`block px-4 py-3 text-sm ${currentPage === "get-golf-ready-level-2"
                ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
              }`}
          >
            GET GOLF READY (LEVEL II)
          </Link>
          <Link
            href="/adult-programs/short-game"
            className={`block px-4 py-3 text-sm ${currentPage === "short-game"
                ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
              }`}
          >
            ADULT SHORT GAME SERIES
          </Link>
          <Link
            href="/adult-programs/women"
            className={`block px-4 py-3 text-sm ${currentPage === "women"
                ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
              }`}
          >
            GOLF FOR WOMEN
          </Link>
          <Link
            href="/adult-programs/private"
            className={`block px-4 py-3 text-sm ${currentPage === "private"
                ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
              }`}
          >
            ADULT PRIVATE GOLF INSTRUCTION
          </Link>
          <Link
            href="/adult-programs/open-practice"
            className={`block px-4 py-3 text-sm ${currentPage === "open-practice"
                ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
              }`}
          >
            ADULT OPEN PRACTICE
          </Link>
        </div>

        {/* Mobile animated nav */}
        <AnimatePresence>
          {showNav && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="lg:hidden overflow-hidden space-y-0 mb-2"
            >
              <Link
                href="/adult-programs/get-golf-ready-level-1"
                onClick={closeNav}
                className={`block px-4 py-2.5 text-sm ${currentPage === "get-golf-ready-level-1"
                    ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                    : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
                  }`}
              >
                GET GOLF READY (LEVEL I)
              </Link>
              <Link
                href="/adult-programs/get-golf-ready-level-2"
                onClick={closeNav}
                className={`block px-4 py-2.5 text-sm ${currentPage === "get-golf-ready-level-2"
                    ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                    : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
                  }`}
              >
                GET GOLF READY (LEVEL II)
              </Link>
              <Link
                href="/adult-programs/short-game"
                onClick={closeNav}
                className={`block px-4 py-2.5 text-sm ${currentPage === "short-game"
                    ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                    : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
                  }`}
              >
                ADULT SHORT GAME SERIES
              </Link>
              <Link
                href="/adult-programs/women"
                onClick={closeNav}
                className={`block px-4 py-2.5 text-sm ${currentPage === "women"
                    ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                    : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
                  }`}
              >
                GOLF FOR WOMEN
              </Link>
              <Link
                href="/adult-programs/private"
                onClick={closeNav}
                className={`block px-4 py-2.5 text-sm ${currentPage === "private"
                    ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                    : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
                  }`}
              >
                ADULT PRIVATE GOLF INSTRUCTION
              </Link>
              <Link
                href="/adult-programs/open-practice"
                onClick={closeNav}
                className={`block px-4 py-2.5 text-sm rounded-md ${currentPage === "open-practice"
                    ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                    : "bg-white text-gray-700 hover:bg-gray-50 font-medium"
                  }`}
              >
                ADULT OPEN PRACTICE
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Calendar - below navigation links */}
        <div className="mt-6">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Session Schedule</CardTitle>
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
                  {sortedSessions.map((session) => {
                    const schedule = session.schedule
                      ? parseSchedule(session.schedule)
                      : null;
                    const startDate =
                      schedule && schedule.length > 0
                        ? new Date(schedule[0].date)
                        : null;
                    const isStarted = startDate
                      ? new Date() > startDate
                      : false;

                    return (
                      <AccordionItem
                        key={session.id}
                        value={session.id}
                        className="border-b last:border-0 px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-3">
                          <span className="font-medium text-sm">
                            {session.name ? session.name : "Session Details"}
                            {isStarted && (
                              <span className="text-red-600 ml-1">
                                (Started)
                              </span>
                            )}
                            {!isStarted && session.isBooked && (
                              <span className="text-red-600 ml-1">
                                (Sold Out)
                              </span>
                            )}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <SessionCalendar schedule={schedule} />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm font-medium">
                  No Sessions Yet
                </div>
              )}
            </CardContent>
          </Card>
          {sessions.some((s) => {
            const schedule = s.schedule ? parseSchedule(s.schedule) : null;
            const startDate =
              schedule && schedule.length > 0
                ? new Date(schedule[0].date)
                : null;
            const isStarted = startDate ? new Date() > startDate : false;
            return isStarted || (s.isBooked ?? false);
          }) && (
              <p className="text-xs text-red-500 mt-2 font-medium">
                * Call to inquire about joining past sessions that have already
                started or are sold out
              </p>
            )}
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
