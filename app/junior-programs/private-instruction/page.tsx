import { CheckCircle2, Phone, CalendarClock } from "lucide-react";
import { getProgramById, getProgramSessions } from "@/db/queries/programs";
import { ProgramDetailsSection } from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import type { ProgramDetail } from "@/lib/program-details";
import type { ProgramSession } from "@/db/schema";
import { JuniorPrivateGolfInstructionClient } from "./JuniorPrivateGolfInstructionClient";

export default async function JuniorPrivateGolfInstruction() {
  const program = await getProgramById("754bf4be-0ef6-4123-b5ff-b107e03c2f10");
  const sessions = program ? await getProgramSessions(program.id) : [];

  if (!program) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          <div className="lg:col-span-3 space-y-2">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Junior Private Golf Instruction
            </h1>
          </div>
          <div className="lg:col-span-6">
            <ProgramComingSoonCard programName="Junior Private Golf Instruction" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <JuniorPrivateGolfInstructionClient
      program={program}
      sessions={sessions}
    />
  );
}
