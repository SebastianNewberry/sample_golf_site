"use client";

import defaultImage from "@/public/adult_short_game.webp";
import { LoadedProgramPage } from "@/app/components/LoadedProgramPage";
import { ShortGameSeriesPageClient } from "./ShortGameSeriesPageClient";

export default function AdultShortGameSeries() {
  return (
    <LoadedProgramPage
      programId="9bc2b2b7-2774-4971-b469-4ce2a8d3a707"
      variant="adult"
      missingTitle="Adult Short Game Series"
      missingName="Adult Short Game Series"
    >
      {({ program, sessions, sessionId }) => (
        <ShortGameSeriesPageClient
          imageUrl={program.imageUrl || undefined}
          defaultImage={defaultImage}
          title={program.name}
          description={program.description || ""}
          programId={program.id}
          programPrice={parseFloat(program.price)}
          duration={program.duration}
          sessions={sessions}
          currentPage="short-game"
          features={program.features || []}
          details={program.details || []}
          initialSessionId={sessionId}
        />
      )}
    </LoadedProgramPage>
  );
}
