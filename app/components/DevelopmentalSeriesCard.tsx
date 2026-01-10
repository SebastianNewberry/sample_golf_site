"use client";

import { useState } from "react";
import { ProgramPurchaseSection } from "@/app/components/ProgramPurchaseSection";
import { ProgramSession } from "@/db/schema";

interface DevelopmentalSeriesCardProps {
  programId: string;
  programName: string;
  programPrice: number;
  duration: string;
  sessions: ProgramSession[];
  selectedSessionId?: string;
  onSessionChange?: (sessionId: string) => void;
}

export function DevelopmentalSeriesCard({
  programId,
  programName,
  programPrice,
  duration,
  sessions,
  selectedSessionId,
  onSessionChange,
}: DevelopmentalSeriesCardProps) {
  const [internalSessionId, setInternalSessionId] = useState<string>("");

  const currentSessionId = selectedSessionId ?? internalSessionId;
  const handleSessionChange = (sessionId: string) => {
    setInternalSessionId(sessionId);
    if (onSessionChange) {
      onSessionChange(sessionId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <img
        src="/junior_development_series.gif"
        alt="Junior Developmental Series"
        className="w-full max-h-[400px] object-cover bg-gray-100"
      />

      <div className="p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-2">
          Junior Developmental Series
        </h1>
        <p className="text-gray-700 text-sm leading-relaxed mb-2">
          Our <strong>Junior Developmental Series</strong> is designed for
          intermediate to advanced junior golfers looking to expand their golf
          skills and improve on-course play, and for those players who
          aspire to play or are already playing competitive golf.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed mb-2">
          The <strong>Junior Developmental Series</strong> builds on
          principles learned in <strong>Junior Beginner Series</strong>.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          You can choose either a package of five (5) or fifteen (15)
          two-hour supervised practice sessions. A personalized improvement
          plan will be developed for each student based on his or her goals,
          ability and commitment level. The plan includes: prioritizing
          skills that still need development, planned practices and drills,
          on-course strategy and management, and monitoring results.
        </p>

        <ProgramPurchaseSection
          programId={programId}
          programName={programName}
          programPrice={programPrice}
          duration={duration}
          sessions={sessions.map((s) => ({ id: s.id, name: s.name }))}
          registrationType="junior"
          selectedSessionId={currentSessionId}
          onSessionChange={handleSessionChange}
        />
      </div>
    </div>
  );
}

