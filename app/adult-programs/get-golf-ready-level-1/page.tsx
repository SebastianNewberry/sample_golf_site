import { CheckCircle2 } from "lucide-react";
import defaultImage from "@/public/golf_ready_level1.webp";
import {
  getProgramById,
  getProgramSessionsWithEnrollment,
} from "@/db/queries/programs";
import { ProgramDetailsSection } from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import {
  programPageContent,
  programPageGrid,
} from "@/app/components/program-page-layout";
import { GetGolfReadyLevel1PageClient } from "./GetGolfReadyLevel1PageClient";

export default async function GetGolfReadyLevel1(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sessionId =
    typeof searchParams.sessionId === "string"
      ? searchParams.sessionId
      : undefined;
  const programId = "583078c5-6e1f-40fc-a1a0-8c1cc88a6d7b";
  const [program, sessions] = await Promise.all([
    getProgramById(programId),
    getProgramSessionsWithEnrollment(programId, "adult"),
  ]);

  return (
    <>
      {/* Main Content Grid - Centered */}
      <div className={programPageContent}>
        <div className={programPageGrid}>
          {program ? (
            <GetGolfReadyLevel1PageClient
              imageUrl={program.imageUrl || undefined}
              defaultImage={defaultImage}
              title={program.name}
              description={program.description || ""}
              programId={program.id}
              programPrice={parseFloat(program.price)}
              duration={program.duration}
              sessions={sessions}
              currentPage="get-golf-ready-level-1"
              features={program.features || []}
              details={program.details || []}
              initialSessionId={sessionId}
            />
          ) : (
            <>
              <div className="lg:col-span-3 space-y-2">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Get Golf Ready Level I
                </h1>
              </div>
              <div className="lg:col-span-7">
                <ProgramComingSoonCard programName="Get Golf Ready (Level I)" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
