import { CheckCircle2, Phone } from "lucide-react";
import defaultImage from "@/public/adult_short_game.webp";
import { getProgramById, getProgramSessions } from "@/db/queries/programs";
import { ProgramDetailsSection } from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import { ShortGameSeriesPageClient } from "./ShortGameSeriesPageClient";

export default async function AdultShortGameSeries() {
  const program = await getProgramById("9bc2b2b7-2774-4971-b469-4ce2a8d3a707");
  const sessions = program ? await getProgramSessions(program.id) : [];

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
              description={[
                `Join us for our next <strong>ADULT SHORT GAME SERIES</strong> program. Our PGA certified instructors will teach you the fundamentals of short game to improve your scoring within 100 yards of the hole.`,
                `This PGA National program is designed for beginners to teach you everything you need to step onto a golf course with confidence.`,
              ]}
              programId={program.id}
              programPrice={parseFloat(program.price)}
              duration={program.duration}
              sessions={sessions}
              currentPage="short-game"
              features={program.features || []}
              details={program.details || []}
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
