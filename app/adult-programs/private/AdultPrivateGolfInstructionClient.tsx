"use client";

import { useState } from "react";
import { CheckCircle2, Video, CalendarClock, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import defaultImage from "@/public/adult_private_instruction.webp";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { SessionCalendar } from "@/app/components/SessionCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseSchedule } from "@/lib/session-schedule";
import type { ProgramSession } from "@/db/schema";

interface AdultPrivateGolfInstructionClientProps {
  program: any;
  sessions: ProgramSession[];
}

export function AdultPrivateGolfInstructionClient({
  program,
  sessions,
}: AdultPrivateGolfInstructionClientProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  // Get selected session's schedule
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const schedule = selectedSession?.schedule
    ? parseSchedule(selectedSession.schedule)
    : null;

  return (
    <>
      {/* Main Content Grid - Centered */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          {/* Left Sidebar - Program Links + Calendar */}
          <div className="lg:col-span-3 space-y-2">
            {/* Header with program name */}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Adult Private Golf Instruction
            </h1>
            <Link
              href="/adult-programs/get-golf-ready-level-1"
              className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              GET GOLF READY (LEVEL I)
            </Link>
            <Link
              href="/adult-programs/get-golf-ready-level-2"
              className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              GET GOLF READY (LEVEL II)
            </Link>
            <Link
              href="/adult-programs/short-game"
              className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ADULT SHORT GAME SERIES
            </Link>
            <Link
              href="/adult-programs/women"
              className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              GOLF FOR WOMEN
            </Link>
            <Link
              href="/adult-programs/private"
              className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
            >
              ADULT PRIVATE GOLF INSTRUCTION
            </Link>
            <Link
              href="/adult-programs/open-practice"
              className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ADULT OPEN PRACTICE
            </Link>

            {/* Session Calendar - below navigation links */}
            <div className="mt-6">
              <SessionCalendar schedule={schedule} />
            </div>
          </div>

          {/* Main Card: Image + Description + Price */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Two-column layout: Image + Description | Pricing */}
              <div className="grid lg:grid-cols-6">
                {/* Left Column: Image + Description + Purchase */}
                <div className="lg:col-span-4">
                  {/* Image */}
                  <div className="relative bg-gray-100">
                    <Image
                      src={program.imageUrl || defaultImage}
                      alt={program.name}
                      width={600}
                      height={400}
                      className="w-full max-h-[400px] object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Right Column: Pricing Options */}
                <div className="p-6 border-gray-200 lg:col-span-2">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">
                    Lesson Packages
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg border text-center">
                      <p className="text-sm text-gray-600">1/2 Hour</p>
                      <p className="text-lg font-bold text-green-700">$70</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border text-center">
                      <p className="text-sm text-gray-600">1 Hour</p>
                      <p className="text-lg font-bold text-green-700">$90</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                      <p className="text-sm text-gray-600">5 Lessons</p>
                      <p className="text-lg font-bold text-green-700">$425</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                      <p className="text-sm text-gray-600">10 Lessons</p>
                      <p className="text-lg font-bold text-green-700">$700</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Description and Purchase */}
              <div className="p-6 border-gray-200">
                <h1 className="text-lg font-bold text-gray-900 mb-2">
                  {program.name}
                </h1>
                <p className="text-gray-700 text-sm leading-relaxed mb-2">
                  Our private golf lesson offers individual instruction with
                  <strong> Paul Toski, PGA Professional</strong>. We identify
                  your goals and any physical limitations that may affect your
                  swing.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  High-speed video analysis of your swing with specific drills
                  and training aids to improve your golf skills.
                </p>

                {/* Session selection label */}
                <p className="text-sm text-gray-500 italic mb-4">
                  Select a duration from pricing options on right, then choose a
                  session below to purchase.
                </p>

                {/* Session selector only */}
                {sessions.length > 0 ? (
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Session:
                    </label>
                    <Select
                      value={selectedSessionId}
                      onValueChange={setSelectedSessionId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose your dates..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((session) => (
                          <SelectItem key={session.id} value={session.id}>
                            {session.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-3 text-amber-700">
                      <CalendarClock size={20} className="shrink-0" />
                      <div>
                        <p className="font-semibold">Dates To Be Determined</p>
                        <p className="text-sm text-amber-600">
                          Contact us to book your lessons
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buy buttons - disabled until session and duration selected */}
                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full py-3.5 font-bold text-base bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    BUY NOW
                  </button>

                  <button
                    disabled
                    className="w-full py-3.5 font-bold text-base border-2 border-green-600 bg-green-50 disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 text-green-700 hover:bg-green-200 hover:border-green-700 disabled:cursor-not-allowed rounded-xl transition-all"
                  >
                    ADD TO CART
                  </button>

                  <a
                    href="tel:+12485633561"
                    className="flex items-center justify-center gap-2 w-full py-3 font-semibold text-gray-600 hover:text-green-700 border border-gray-200 rounded-xl hover:border-green-300 transition-all"
                  >
                    <Phone size={18} />
                    Call to Schedule
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Features & Details */}
          <div className="lg:col-span-4 space-y-6">
            <ProgramFeaturesAndDetails
              features={program.features || []}
              details={program.details || []}
            />
          </div>
        </div>
      </div>
    </>
  );
}
