import {
  getProgramById,
  getProgramSessionsWithEnrollment,
} from "@/db/queries/programs";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
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

  return (
    <>
      {/* Main Content Grid - Centered */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          {program ? (
            <>
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
            </>
          ) : (
            <ProgramComingSoonCard programName="Junior Developmental Series" />
          )}
        </div>
      </div>
    </>
  );
}
