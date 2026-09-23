"use client";

import defaultImage from "@/public/golf_ready_level1.webp";
import { LoadedProgramPage } from "@/app/components/LoadedProgramPage";
import { GetGolfReadyLevel1PageClient } from "./GetGolfReadyLevel1PageClient";

export default function GetGolfReadyLevel1() {
  return (
    <LoadedProgramPage
      programId="583078c5-6e1f-40fc-a1a0-8c1cc88a6d7b"
      variant="adult"
      missingTitle="Get Golf Ready Level I"
      missingName="Get Golf Ready (Level I)"
    >
      {({ program, sessions, sessionId }) => (
        <GetGolfReadyLevel1PageClient
          imageUrl={program.imageUrl || undefined}
          defaultImage={defaultImage}
          title={program.name}
          description={program.description || ""}
          programId={program.id}
          programPrice={parseFloat(program.price)}
          duration={program.duration}
          sessions={sessions}
          currentPage="get-golf-ready-level-1"
          features={program.features || []}
          details={program.details || []}
          initialSessionId={sessionId}
        />
      )}
    </LoadedProgramPage>
  );
}
