import { CheckCircle2 } from "lucide-react";
import defaultImage from "@/public/golf_for_women.webp";
import {
  getProgramById,
  getProgramSessionsWithEnrollment,
} from "@/db/queries/programs";
import { ProgramDetailsSection } from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import type { ProgramDetail } from "@/lib/program-details";
import { GolfForWomenPageClient } from "./GolfForWomenPageClient";

export default async function GolfForWomenProgram(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sessionId =
    typeof searchParams.sessionId === "string"
      ? searchParams.sessionId
      : undefined;
  const programId = "9160a3a8-a652-4ddf-a13f-298336168e04";
  const [program, sessions] = await Promise.all([
    getProgramById(programId),
    getProgramSessionsWithEnrollment(programId, "adult"),
  ]);

  return (
    <>
      {/* Main Content Grid - Centered */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          {program ? (
            <GolfForWomenPageClient
              imageUrl={program.imageUrl || undefined}
              defaultImage={defaultImage}
              title={program.name}
              description={program.description || ""}
              programId={program.id}
              programPrice={parseFloat(program.price)}
              duration={program.duration}
              sessions={sessions}
              currentPage="women"
              features={program.features || []}
              details={program.details || []}
              initialSessionId={sessionId}
            />
          ) : (
            <>
              <div className="lg:col-span-3 space-y-2">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Golf For Women
                </h1>
              </div>
              <div className="lg:col-span-6">
                <ProgramComingSoonCard programName="Golf For Women" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
