import { CheckCircle2 } from "lucide-react";
import defaultImage from "@/public/junior_golf_camp.webp";
import { getProgramById, getProgramSessions } from "@/db/queries/programs";
import { ProgramCard } from "@/app/components/ProgramCard";
import { ProgramDetailsSection } from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import type { ProgramDetail } from "@/lib/program-details";
import { DevelopmentalCampPageClient } from "./DevelopmentalCampPageClient";

export default async function JuniorDevelopmentalGolfCamp() {
  const program = await getProgramById("8102629d-9ec3-4034-beca-16683db482f2");
  const sessions = program ? await getProgramSessions(program.id) : [];

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
              description={[
                `Join us for our next <strong>JUNIOR DEVELOPMENTAL GOLF CAMP</strong> program. Our PGA certified instructors will teach you the fundamentals of golf.`,
                `This PGA National program is designed for beginners to teach you everything you need to step onto a golf course with confidence.`,
              ]}
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
              <div className="lg:col-span-6">
                <ProgramComingSoonCard programName="Junior Developmental Golf Camp" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
