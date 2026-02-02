import { CheckCircle2 } from "lucide-react";
import defaultImage from "@/public/golf_ready_level1.webp";
import { getProgramById, getProgramSessions } from "@/db/queries/programs";
import { ProgramDetailsSection } from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import { GetGolfReadyLevel1PageClient } from "./GetGolfReadyLevel1PageClient";

export default async function GetGolfReadyLevel1(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sessionId = typeof searchParams.sessionId === "string" ? searchParams.sessionId : undefined;
  const program = await getProgramById("583078c5-6e1f-40fc-a1a0-8c1cc88a6d7b");
  const sessions = program ? await getProgramSessions(program.id) : [];

  return (
    <>
      {/* Main Content Grid - Centered */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          {program ? (
            <GetGolfReadyLevel1PageClient
              imageUrl={program.imageUrl || undefined}
              defaultImage={defaultImage}
              title={program.name}
              description={[
                `Join us for our next <strong>GET GOLF READY</strong> program. Our PGA certified instructors will teach you basics so you can participate in a corporate outing, or simply create a foundation to enjoy golf.`,
                `This PGA National program is designed for beginners to teach you everything you need to step onto a golf course with confidence.`,
              ]}
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
              <div className="lg:col-span-6">
                <ProgramComingSoonCard programName="Get Golf Ready (Level I)" />
              </div>
            </>
          )}
        </div>
      </div >
    </>
  );
}
