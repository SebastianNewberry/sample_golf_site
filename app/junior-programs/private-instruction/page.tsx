"use client";

import { useEffect, useRef } from "react";
import ProgramComingSoonCard from "@/app/components/ProgramComingSoonCard";
import { PrivateInstructionSkeleton } from "@/app/components/PrivateInstructionSkeleton";
import { useProgramCatalog } from "@/app/components/ProgramCatalogContext";
import { usePrivateInstructionSlots } from "@/app/components/usePrivateInstructionSlots";
import {
  programPageContent,
  programPageReveal,
} from "@/app/components/program-page-layout";
import { JuniorPrivateGolfInstructionClient } from "./JuniorPrivateGolfInstructionClient";

const PROGRAM_ID = "754bf4be-0ef6-4123-b5ff-b107e03c2f10";

export default function JuniorPrivateGolfInstruction() {
  const { status, getProgram, ensureLoaded } = useProgramCatalog();
  const { slots, loading } = usePrivateInstructionSlots("junior");
  const revealOnReady = useRef(status !== "ready");

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  if (status !== "ready") {
    return <PrivateInstructionSkeleton layout="junior" />;
  }

  const record = getProgram(PROGRAM_ID);
  const contentClassName = revealOnReady.current
    ? programPageReveal
    : programPageContent;

  if (!record) {
    return (
      <div className={contentClassName}>
        <div className="grid lg:grid-cols-13 gap-6">
          <div className="lg:col-span-3 space-y-2">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Junior Private Golf Instruction
            </h1>
          </div>
          <div className="lg:col-span-7">
            <ProgramComingSoonCard programName="Junior Private Golf Instruction" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <JuniorPrivateGolfInstructionClient
      program={record.program}
      initialAvailableSlots={slots}
      slotsLoading={loading}
    />
  );
}
