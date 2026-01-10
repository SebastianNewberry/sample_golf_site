import { CheckCircle2 } from "lucide-react";
import defaultImage from "@/public/junior_golf_camp.webp";
import { getProgramById, getProgramSessions } from "@/db/queries/programs";
import { ProgramDetailsSection } from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import type { ProgramDetail } from "@/lib/program-details";
import { GolfCampPageClient } from "./GolfCampPageClient";

export default async function JuniorGolfCamp() {
  const program = await getProgramById("8102629d-9ec3-4034-beca-16683db482f2");
  const sessions = program ? await getProgramSessions(program.id) : [];

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
