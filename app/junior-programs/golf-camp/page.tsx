import defaultImage from "@/public/junior_golf_camp.webp";
import {
  getProgramById,
  getProgramSessionsWithEnrollment,
} from "@/db/queries/programs";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import { GolfCampPageClient } from "./GolfCampPageClient";

export default async function JuniorGolfCamp(props: {
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
            <GolfCampPageClient
              imageUrl={program.imageUrl || undefined}
              defaultImage={defaultImage}
              title={program.name}
              description={[
                `Join us for our next <strong>JUNIOR GOLF CAMP</strong> program. Our PGA certified instructors will teach you fundamentals of golf.`,
                `This PGA National program is designed for beginners to teach you everything you need to step onto a golf course with confidence.`,
              ]}
              programId={program.id}
              programPrice={parseFloat(program.price)}
              duration={program.duration}
              sessions={sessions}
              currentPage="golf-camp"
              features={program.features || []}
              details={program.details || []}
              initialSessionId={sessionId}
            />
          ) : (
            <>
              <div className="lg:col-span-3 space-y-2">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Junior Golf Camp
                </h1>
              </div>
              <div className="lg:col-span-6">
                <ProgramComingSoonCard programName="Junior Golf Camp" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
