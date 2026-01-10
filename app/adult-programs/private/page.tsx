import { CheckCircle2, Video, CalendarClock, Phone } from "lucide-react";
import { getProgramById, getProgramSessions } from "@/db/queries/programs";
import {
  ProgramDetailsSection,
  DEFAULT_ADULT_PROGRAM_DETAILS,
} from "@/app/components/ProgramDetailsSection";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import type { ProgramDetail } from "@/lib/program-details";
import type { ProgramSession } from "@/db/schema";
import { AdultPrivateGolfInstructionClient } from "./AdultPrivateGolfInstructionClient";

export default async function AdultPrivateGolfInstruction() {
  const program = await getProgramById("f89b62ee-ffda-421d-a525-8bd2a580f24e");
  const sessions = program ? await getProgramSessions(program.id) : [];

  if (!program) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-13 gap-6">
          <div className="lg:col-span-3 space-y-2">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Adult Private Golf Instruction
            </h1>
          </div>
          <div className="lg:col-span-6">
            <ProgramComingSoonCard programName="Adult Private Golf Instruction" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdultPrivateGolfInstructionClient program={program} sessions={sessions} />
  );
}
