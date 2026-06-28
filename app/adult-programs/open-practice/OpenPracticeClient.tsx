"use client";

import { ProgramCard } from "@/app/components/ProgramCard";

interface OpenPracticeClientProps {
  imageUrl?: string;
  defaultImage: any;
  title: string;
  description: string;
  programId: string;
  programPrice: number;
  duration: string;
  sessions: Array<{ id: string; name: string; startDate?: string | Date }>;
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
    />
  );
}
