"use client";

import { ProgramCard } from "@/app/components/ProgramCard";
import { Phone } from "lucide-react";

interface OpenPracticeClientProps {
  imageUrl?: string;
  defaultImage: any;
  title: string;
  description: string[];
  programId: string;
  programPrice: number;
  duration: string;
  sessions: Array<{ id: string; name: string }>;
  selectedSessionId: string;
  onSessionChange: (sessionId: string) => void;
}

export function OpenPracticeClient({
  imageUrl,
  defaultImage,
  title,
  description,
  programId,
  programPrice,
  duration,
  sessions,
  selectedSessionId,
  onSessionChange,
}: OpenPracticeClientProps) {
  const actualSessions = sessions.length > 0
    ? sessions
    : [
        {
          id: "saturday",
          name: "Saturday 11:00 AM - Call to Reserve",
        },
      ];

  return (
    <ProgramCard
      imageUrl={imageUrl}
      alt={title}
      defaultImage={defaultImage}
      title={title}
      description={description}
      programId={programId}
      programPrice={programPrice}
      duration={duration}
      sessions={actualSessions}
      registrationType="adult"
      selectedSessionId={selectedSessionId}
      onSessionChange={onSessionChange}
      showContactButton={true}
      extraContent={
        <div className="border-t border-gray-200 pt-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={16} className="text-green-600" />
              <h3 className="text-sm font-bold text-gray-800">
                Upcoming Sessions
              </h3>
            </div>
            <p className="text-sm text-gray-700 font-semibold">
              Every Saturday at 11:00 AM • April - October
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Limited to 4 students
            </p>
          </div>
        </div>
      }
    />
  );
}
