"use client";

import defaultImage from "@/public/junior_beginner_series.webp";
import { LoadedProgramPage } from "@/app/components/LoadedProgramPage";
import { BeginnerSeriesPageClient } from "./BeginnerSeriesPageClient";

export default function JuniorBeginnerSeries() {
  return (
    <LoadedProgramPage
      programId="0284e4eb-fd96-4626-9009-272b7d985d88"
      variant="junior"
      missingTitle="Junior Beginner Series"
      missingName="Junior Beginner Series"
    >
      {({ program, sessions, sessionId }) => (
        <BeginnerSeriesPageClient
          imageUrl={program.imageUrl || undefined}
          defaultImage={defaultImage}
          title={program.name}
          description={program.description || ""}
          programId={program.id}
          programPrice={parseFloat(program.price)}
          duration={program.duration}
          sessions={sessions}
          currentPage="beginner-series"
          features={program.features || []}
          details={program.details || []}
          initialSessionId={sessionId}
        />
      )}
    </LoadedProgramPage>
  );
}
