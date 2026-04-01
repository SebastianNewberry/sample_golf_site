import { CheckCircle2, Phone } from "lucide-react";
import defaultImage from "@/public/adult_short_game.webp";
import {
  getProgramById,
  getProgramSessionsWithEnrollment,
} from "@/db/queries/programs";
import { ProgramDetailsSection } from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import { ShortGameSeriesPageClient } from "./ShortGameSeriesPageClient";

export default async function AdultShortGameSeries(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sessionId =
    typeof searchParams.sessionId === "string"
      ? searchParams.sessionId
      : undefined;
  const program = await getProgramById("9bc2b2b7-2774-4971-b469-4ce2a8d3a707");
  const sessions = program
    ? await getProgramSessionsWithEnrollment(program.id, "adult")
    : [];

  return (
    <>
      {/* Main Content Grid - Centered */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          {program ? (
            <ShortGameSeriesPageClient
              imageUrl={program.imageUrl || undefined}
              defaultImage={defaultImage}
              title={program.name}
              description={program.description || ""}
              programId={program.id}
              programPrice={parseFloat(program.price)}
              duration={program.duration}
              sessions={sessions}
              currentPage="short-game"
              features={program.features || []}
              details={program.details || []}
              initialSessionId={sessionId}
            />
          ) : (
            <>
              <div className="lg:col-span-3 space-y-2">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Adult Short Game Series
                </h1>
              </div>
              <div className="lg:col-span-6">
                <ProgramComingSoonCard programName="Adult Short Game Series" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
