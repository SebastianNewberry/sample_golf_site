"use client";

import defaultImage from "@/public/adult_open_practice.webp";
import { LoadedProgramPage } from "@/app/components/LoadedProgramPage";
import { OpenPracticePageClient } from "./OpenPracticePageClient";

export default function AdultOpenPractice() {
  return (
    <LoadedProgramPage
      programId="0dc3ac70-8346-44c4-9ef6-b638ccbb9082"
      variant="adult"
      missingTitle="Adult Open Practice"
      missingName="Adult Open Practice"
    >
      {({ program, sessions, sessionId }) => (
        <OpenPracticePageClient
          imageUrl={program.imageUrl || undefined}
          defaultImage={defaultImage}
          title={program.name}
          description={program.description || ""}
          programId={program.id}
          programPrice={parseFloat(program.price)}
          duration={program.duration}
          sessions={sessions}
          currentPage="open-practice"
          features={program.features || []}
          details={program.details || []}
          initialSessionId={sessionId}
        />
      )}
    </LoadedProgramPage>
  );
}
