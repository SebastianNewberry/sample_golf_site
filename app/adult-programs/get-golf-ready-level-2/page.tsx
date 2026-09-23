"use client";

import defaultImage from "@/public/golf_ready_level2.webp";
import { LoadedProgramPage } from "@/app/components/LoadedProgramPage";
import { GetGolfReadyLevel2PageClient } from "./GetGolfReadyLevel2PageClient";

export default function GetGolfReadyLevel2() {
  return (
    <LoadedProgramPage
      programId="eb15499e-b573-4027-a2dc-1335bc7613b1"
      variant="adult"
      missingTitle="Get Golf Ready Level II"
      missingName="Get Golf Ready (Level II)"
    >
      {({ program, sessions, sessionId }) => (
        <GetGolfReadyLevel2PageClient
          imageUrl={program.imageUrl || undefined}
          defaultImage={defaultImage}
          title={program.name}
          description={program.description || ""}
          programId={program.id}
          programPrice={parseFloat(program.price)}
          duration={program.duration}
          sessions={sessions}
          currentPage="get-golf-ready-level-2"
          features={program.features || []}
          details={program.details || []}
          initialSessionId={sessionId}
        />
      )}
    </LoadedProgramPage>
  );
}
