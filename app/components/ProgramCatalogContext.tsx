"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { PROGRAM_CATALOG } from "@/lib/program-catalog";
import type {
  ProgramCatalogRecord,
  ProgramCatalogSession,
} from "@/lib/program-catalog-data";
import type { Program } from "@/db/schema";

type CatalogStatus = "idle" | "loading" | "ready" | "error";

type ProgramCatalogContextValue = {
  status: CatalogStatus;
  error: string | null;
  getProgram: (programId: string) => ProgramCatalogRecord | null;
  ensureLoaded: () => void;
};

const ProgramCatalogContext = createContext<ProgramCatalogContextValue | null>(
  null,
);

type WireProgram = Omit<Program, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type WireSession = Omit<
  ProgramCatalogSession,
  "startDate" | "endDate" | "createdAt" | "updatedAt"
> & {
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

type WireRecord = Omit<ProgramCatalogRecord, "program" | "sessions"> & {
  program: WireProgram;
  sessions: WireSession[];
};

let cachedPrograms: Map<string, ProgramCatalogRecord> | null = null;
let inflight: Promise<Map<string, ProgramCatalogRecord>> | null = null;

const sharedProgramHrefs = PROGRAM_CATALOG.map((entry) => entry.href);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function reviveDate(value: string): Date {
  return new Date(value);
}

function reviveRecord(record: WireRecord): ProgramCatalogRecord {
  return {
    ...record,
    program: {
      ...record.program,
      createdAt: reviveDate(record.program.createdAt),
      updatedAt: reviveDate(record.program.updatedAt),
    },
    sessions: record.sessions.map((session) => ({
      ...session,
      startDate: reviveDate(session.startDate),
      endDate: reviveDate(session.endDate),
      createdAt: reviveDate(session.createdAt),
      updatedAt: reviveDate(session.updatedAt),
    })),
  };
}

function isCatalogPayload(value: unknown): value is { programs: WireRecord[] } {
  if (!isRecord(value) || !Array.isArray(value.programs)) return false;
  return value.programs.every((item) => {
    if (!isRecord(item) || !isRecord(item.program)) return false;
    return typeof item.program.id === "string" && Array.isArray(item.sessions);
  });
}

function loadCatalog(): Promise<Map<string, ProgramCatalogRecord>> {
  if (cachedPrograms) return Promise.resolve(cachedPrograms);
  if (!inflight) {
    inflight = fetch("/api/programs/catalog")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load programs");
        const body: unknown = await response.json();
        if (!isCatalogPayload(body)) throw new Error("Failed to load programs");
        const programs = new Map<string, ProgramCatalogRecord>();
        for (const record of body.programs) {
          const revived = reviveRecord(record);
          programs.set(revived.program.id, revived);
        }
        cachedPrograms = programs;
        return programs;
      })
      .catch((error: unknown) => {
        inflight = null;
        throw error;
      });
  }
  return inflight;
}

export function ProgramCatalogProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<CatalogStatus>(
    cachedPrograms ? "ready" : "idle",
  );
  const [programs, setPrograms] = useState<Map<string, ProgramCatalogRecord> | null>(
    cachedPrograms,
  );
  const [error, setError] = useState<string | null>(null);

  const ensureLoaded = useCallback(() => {
    if (cachedPrograms) {
      setPrograms(cachedPrograms);
      setStatus("ready");
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);
    loadCatalog()
      .then((nextPrograms) => {
        setPrograms(nextPrograms);
        setStatus("ready");
      })
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load programs",
        );
        setStatus("error");
      });
  }, []);

  const getProgram = useCallback(
    (programId: string) => programs?.get(programId) ?? null,
    [programs],
  );

  useEffect(() => {
    if (status !== "ready") return;
    for (const href of sharedProgramHrefs) {
      router.prefetch(href);
    }
  }, [status, router]);

  return (
    <ProgramCatalogContext.Provider
      value={{ status, error, getProgram, ensureLoaded }}
    >
      {children}
    </ProgramCatalogContext.Provider>
  );
}

export function useProgramCatalog() {
  const value = useContext(ProgramCatalogContext);
  if (!value) {
    throw new Error("useProgramCatalog must be used within ProgramCatalogProvider");
  }
  return value;
}

/** Start the one-time catalog fetch without blocking the current page. */
export function useWarmProgramCatalog() {
  const { ensureLoaded } = useProgramCatalog();
  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);
}
