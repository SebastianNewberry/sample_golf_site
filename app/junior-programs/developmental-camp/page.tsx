"use client";

import defaultImage from "@/public/junior_golf_camp.webp";
import { LoadedProgramPage } from "@/app/components/LoadedProgramPage";
import { DevelopmentalCampPageClient } from "./DevelopmentalCampPageClient";

export default function JuniorDevelopmentalGolfCamp() {
  return (
    <LoadedProgramPage
      programId="8102629d-9ec3-4034-beca-16683db482f2"
      variant="junior"
      missingTitle="Junior Developmental Golf Camp"
      missingName="Junior Developmental Golf Camp"
    >
      {({ program, sessions }) => (
        <DevelopmentalCampPageClient
          imageUrl={program.imageUrl || undefined}
          defaultImage={defaultImage}
          title={program.name}
          description={program.description || ""}
          programId={program.id}
          programPrice={parseFloat(program.price)}
          duration={program.duration}
          sessions={sessions}
          currentPage="developmental-camp"
          features={program.features || []}
          details={program.details || []}
        />
      )}
    </LoadedProgramPage>
  );
}
