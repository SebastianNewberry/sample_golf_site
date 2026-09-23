"use client";

import { LoadedProgramPage } from "@/app/components/LoadedProgramPage";
import { DevelopmentalSeriesPageWrapper } from "@/app/components/DevelopmentalSeriesPageWrapper";
import { DevelopmentalSeriesClient } from "./DevelopmentalSeriesClient";

export default function JuniorDevelopmentalSeries() {
  return (
    <LoadedProgramPage
      programId="cc6a73ca-95fb-4acb-be01-6cee4ce44475"
      variant="junior"
      missingTitle="Junior Developmental Series"
      missingName="Junior Developmental Series"
    >
      {({ program, sessions, sessionId, slotEnrollment, pricingOptions }) =>
        program.schedulingType === "series" ? (
          <DevelopmentalSeriesClient
            program={{
              id: program.id,
              name: program.name,
              description: program.description,
              price: program.price,
              duration: program.duration,
              schedulingType: program.schedulingType,
              seriesCapacityPerSlot: program.seriesCapacityPerSlot,
              features: program.features,
              details: program.details,
              pricingOptions,
              imageUrl: program.imageUrl,
            }}
            sessions={sessions}
            slotEnrollmentData={slotEnrollment}
          />
        ) : (
          <DevelopmentalSeriesPageWrapper
            programId={program.id}
            programName={program.name}
            programPrice={parseFloat(program.price)}
            duration={program.duration}
            sessions={sessions}
            features={program.features || []}
            details={program.details || []}
            initialSessionId={sessionId}
          />
        )
      }
    </LoadedProgramPage>
  );
}
