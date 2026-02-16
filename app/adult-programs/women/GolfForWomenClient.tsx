"use client";

import { ProgramCard } from "@/app/components/ProgramCard";

interface GolfForWomenClientProps {
  imageUrl?: string;
  defaultImage: any;
  title: string;
  description: string[];
  programId: string;
  programPrice: number;
  duration: string;
  sessions: Array<{ id: string; name: string; startDate?: string | Date }>;

  selectedSessionId: string;
  onSessionChange: (sessionId: string) => void;
}

export function GolfForWomenClient({
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
}: GolfForWomenClientProps) {
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
      sessions={sessions}
      registrationType="adult"
      selectedSessionId={selectedSessionId}
      onSessionChange={onSessionChange}
    />
  );
}
