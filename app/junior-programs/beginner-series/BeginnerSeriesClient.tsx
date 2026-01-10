"use client";

import { ProgramCard } from "@/app/components/ProgramCard";

interface BeginnerSeriesClientProps {
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

export function BeginnerSeriesClient({
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
}: BeginnerSeriesClientProps) {
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
