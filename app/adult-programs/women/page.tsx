"use client";

import defaultImage from "@/public/golf_for_women.webp";
import { LoadedProgramPage } from "@/app/components/LoadedProgramPage";
import { GolfForWomenPageClient } from "./GolfForWomenPageClient";

export default function GolfForWomenProgram() {
  return (
    <LoadedProgramPage
      programId="9160a3a8-a652-4ddf-a13f-298336168e04"
      variant="adult"
      tallImage
      missingTitle="Golf For Women"
      missingName="Golf For Women"
    >
      {({ program, sessions, sessionId }) => (
        <GolfForWomenPageClient
          imageUrl={program.imageUrl || undefined}
          defaultImage={defaultImage}
          title={program.name}
          description={program.description || ""}
          programId={program.id}
          programPrice={parseFloat(program.price)}
          duration={program.duration}
          sessions={sessions}
          currentPage="women"
          features={program.features || []}
          details={program.details || []}
          initialSessionId={sessionId}
        />
      )}
    </LoadedProgramPage>
  );
}
