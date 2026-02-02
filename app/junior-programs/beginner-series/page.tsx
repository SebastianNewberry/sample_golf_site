import defaultImage from "@/public/junior_beginner_series.webp";
import { getProgramById, getProgramSessions } from "@/db/queries/programs";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import { BeginnerSeriesPageClient } from "./BeginnerSeriesPageClient";

export default async function JuniorBeginnerSeries(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sessionId = typeof searchParams.sessionId === "string" ? searchParams.sessionId : undefined;
  const program = await getProgramById("0284e4eb-fd96-4626-9009-272b7d985d88");
  const sessions = program ? await getProgramSessions(program.id) : [];

  return (
    <>
      {/* Main Content Grid - Centered */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          {program ? (
            <BeginnerSeriesPageClient
              imageUrl={program.imageUrl || undefined}
              defaultImage={defaultImage}
              title={program.name}
              description={[
                `Join us for our next <strong>JUNIOR BEGINNER SERIES</strong> program. Our PGA certified instructors will teach you the fundamentals of golf.`,
                `This PGA National program is designed for beginners to teach you everything you need to step onto a golf course with confidence.`,
              ]}
              programId={program.id}
              programPrice={parseFloat(program.price)}
              duration={program.duration}
              sessions={sessions}
              currentPage="beginner-series"
              features={program.features || []}
              details={program.details || []}
              initialSessionId={sessionId}
            />
          ) : (
            <>
              <div className="lg:col-span-3 space-y-2">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Junior Beginner Series
                </h1>
              </div>
              <div className="lg:col-span-6">
                <ProgramComingSoonCard programName="Junior Beginner Series" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
