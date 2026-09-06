"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  buildVisibilityIndex,
  type ProgramAudience,
  type ProgramVisibilityRow,
} from "@/lib/program-catalog";

type ProgramVisibilityContextValue = ReturnType<typeof buildVisibilityIndex>;

const ProgramVisibilityContext = createContext<ProgramVisibilityContextValue>(
  buildVisibilityIndex([]),
);

export function ProgramVisibilityProvider({
  programs,
  children,
}: {
  programs: ProgramVisibilityRow[];
  children: ReactNode;
}) {
  const value = useMemo(() => buildVisibilityIndex(programs), [programs]);

  return (
    <ProgramVisibilityContext.Provider value={value}>
      {children}
    </ProgramVisibilityContext.Provider>
  );
}

export function useProgramVisibility() {
  return useContext(ProgramVisibilityContext);
}

export function useVisibleProgramLinks(type: ProgramAudience) {
  const { visibleCatalog } = useProgramVisibility();
  return visibleCatalog(type, true);
}
