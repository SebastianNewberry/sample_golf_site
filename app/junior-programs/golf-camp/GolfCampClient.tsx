"use client";

import { ProgramCard } from "@/app/components/ProgramCard";

interface GolfCampClientProps {
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

export function GolfCampClient({
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
}: GolfCampClientProps) {
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
      registrationType="junior"
      selectedSessionId={selectedSessionId}
      onSessionChange={onSessionChange}
    />
  );
}
