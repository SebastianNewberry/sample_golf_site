import defaultImage from "@/public/junior_golf_camp.webp";
import {
  getProgramById,
  getProgramSessionsWithEnrollment,
} from "@/db/queries/programs";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import { DevelopmentalCampPageClient } from "./DevelopmentalCampPageClient";

export default async function JuniorDevelopmentalGolfCamp(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sessionId =
    typeof searchParams.sessionId === "string"
      ? searchParams.sessionId
      : undefined;
  const program = await getProgramById("8102629d-9ec3-4034-beca-16683db482f2");
  const sessions = program
    ? await getProgramSessionsWithEnrollment(program.id, "junior")
    : [];

  return (
    <>
      {/* Main Content Grid - Centered */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          {program ? (
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
          ) : (
            <>
              <div className="lg:col-span-3 space-y-2">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Junior Developmental Golf Camp
                </h1>
              </div>
              <div className="lg:col-span-7">
                <ProgramComingSoonCard programName="Junior Developmental Golf Camp" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
