import { CheckCircle2, Phone } from "lucide-react";
import defaultImage from "@/public/adult_open_practice.webp";
import {
  getProgramById,
  getProgramSessionsWithEnrollment,
} from "@/db/queries/programs";
import { ProgramDetailsSection } from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import type { ProgramDetail } from "@/lib/program-details";
import {
  programPageContent,
  programPageGrid,
} from "@/app/components/program-page-layout";
import { OpenPracticePageClient } from "./OpenPracticePageClient";

export default async function AdultOpenPractice(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sessionId =
    typeof searchParams.sessionId === "string"
      ? searchParams.sessionId
      : undefined;
  const programId = "0dc3ac70-8346-44c4-9ef6-b638ccbb9082";
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
            <OpenPracticePageClient
              imageUrl={program.imageUrl || undefined}
              defaultImage={defaultImage}
              title={program.name}
              description={program.description || ""}
              programId={program.id}
              programPrice={parseFloat(program.price)}
              duration={program.duration}
              sessions={sessions}
              currentPage="open-practice"
              features={program.features || []}
              details={program.details || []}
              initialSessionId={sessionId}
            />
          ) : (
            <>
              <div className="lg:col-span-3 space-y-2">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Adult Open Practice
                </h1>
              </div>
              <div className="lg:col-span-7">
                <ProgramComingSoonCard programName="Adult Open Practice" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
