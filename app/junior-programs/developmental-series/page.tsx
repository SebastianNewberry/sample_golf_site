import {
  getProgramById,
  getProgramSessionsWithEnrollment,
  getSeriesSlotEnrollment,
} from "@/db/queries/programs";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import {
  programPageContent,
  programPageGrid,
} from "@/app/components/program-page-layout";
import { DevelopmentalSeriesClient } from "./DevelopmentalSeriesClient";
import { DevelopmentalSeriesPageWrapper } from "@/app/components/DevelopmentalSeriesPageWrapper";

export default async function JuniorDevelopmentalSeries(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sessionId =
    typeof searchParams.sessionId === "string"
      ? searchParams.sessionId
      : undefined;
  const programId = "cc6a73ca-95fb-4acb-be01-6cee4ce44475";
  const [program, sessions] = await Promise.all([
    getProgramById(programId),
    getProgramSessionsWithEnrollment(programId, "junior"),
  ]);

  // For series programs, fetch per-slot enrollment for all active sessions
  let slotEnrollmentData: Record<
    string,
    {
      slotDate: string;
      slotStartTime: string;
      slotEndTime: string;
      enrolledCount: number;
    }[]
  > = {};

  if (program?.schedulingType === "series") {
    for (const session of sessions) {
      const enrollment = await getSeriesSlotEnrollment(session.id);
      slotEnrollmentData[session.id] = enrollment;
    }
  }

  // Parse pricingOptions from DB
  let pricingOptions: any[] = [];
  if (program?.pricingOptions) {
    try {
      pricingOptions =
        typeof program.pricingOptions === "string"
          ? JSON.parse(program.pricingOptions)
          : program.pricingOptions;
    } catch (e) {
      console.error("Failed to parse pricingOptions", e);
    }
  }

  return (
    <>
      {/* Main Content Grid - Centered */}
      <div className={programPageContent}>
        <div className={programPageGrid}>
          {program ? (
            <>
              {program.schedulingType === "series" ? (
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
                    pricingOptions: pricingOptions,
                    imageUrl: program.imageUrl,
                  }}
                  sessions={sessions}
                  slotEnrollmentData={slotEnrollmentData}
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
              )}
            </>
          ) : (
            <ProgramComingSoonCard programName="Junior Developmental Series" />
          )}
        </div>
      </div>
    </>
  );
}
