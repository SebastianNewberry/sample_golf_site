import { CheckCircle2 } from "lucide-react";
import { getProgramById, getProgramSessions } from "@/db/queries/programs";
import { ProgramDetailsSection } from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import { ProgramFeaturesAndDetails } from "@/app/components/ProgramFeaturesAndDetails";
import { DevelopmentalSeriesPageWrapper } from "@/app/components/DevelopmentalSeriesPageWrapper";

export default async function JuniorDevelopmentalSeries() {
  const program = await getProgramById("cc6a73ca-95fb-4acb-be01-6cee4ce44475");
  const sessions = program ? await getProgramSessions(program.id) : [];

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
