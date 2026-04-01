import { CheckCircle2 } from "lucide-react";
import defaultImage from "@/public/golf_ready_level2.webp";
import {
  getProgramById,
  getProgramSessionsWithEnrollment,
} from "@/db/queries/programs";
import { ProgramDetailsSection } from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import { GetGolfReadyLevel2PageClient } from "./GetGolfReadyLevel2PageClient";

export default async function GetGolfReadyLevel2(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sessionId =
    typeof searchParams.sessionId === "string"
      ? searchParams.sessionId
      : undefined;
  const program = await getProgramById("eb15499e-b573-4027-a2dc-1335bc7613b1");
  const sessions = program
    ? await getProgramSessionsWithEnrollment(program.id, "adult")
    : [];

  return (
    <>
      {/* Main Content Grid - Centered */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          {program ? (
            <GetGolfReadyLevel2PageClient
              imageUrl={program.imageUrl || undefined}
              defaultImage={defaultImage}
              title={program.name}
              description={program.description || ""}
              programId={program.id}
              programPrice={parseFloat(program.price)}
              duration={program.duration}
              sessions={sessions}
              currentPage="get-golf-ready-level-2"
              features={program.features || []}
              details={program.details || []}
              initialSessionId={sessionId}
            />
          ) : (
            <>
              <div className="lg:col-span-3 space-y-2">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Get Golf Ready Level II
                </h1>
              </div>
              <div className="lg:col-span-6">
                <ProgramComingSoonCard programName="Get Golf Ready (Level II)" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
