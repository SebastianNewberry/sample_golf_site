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
import { AdultPrivateGolfInstructionClient } from "./AdultPrivateGolfInstructionClient";

const PROGRAM_ID = "f89b62ee-ffda-421d-a525-8bd2a580f24e";

export default function AdultPrivateGolfInstruction() {
  const { status, getProgram, ensureLoaded } = useProgramCatalog();
  const { slots, loading } = usePrivateInstructionSlots("adult");
  const revealOnReady = useRef(status !== "ready");

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  if (status !== "ready") {
    return <PrivateInstructionSkeleton layout="adult" />;
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
              Adult Private Golf Instruction
            </h1>
          </div>
          <div className="lg:col-span-7">
            <ProgramComingSoonCard programName="Adult Private Golf Instruction" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdultPrivateGolfInstructionClient
      program={record.program}
      initialAvailableSlots={slots}
      slotsLoading={loading}
    />
  );
}
