import { useCallback, useState } from "react";

/**
 * Survives route remounts so the mobile program list stays open while
 * navigating between programs (and the orange indicator can slide).
 */
let mobileProgramsOpen = false;

export function getProgramMobileNavOpen() {
  return mobileProgramsOpen;
}

/** Mobile program sidebar: toggled manually; stays open across program links. */
export function useProgramSidebarNav() {
  const [showNav, setShowNav] = useState(mobileProgramsOpen);

  const toggleNav = useCallback(() => {
    setShowNav((open) => {
      const next = !open;
      mobileProgramsOpen = next;
      return next;
    });
  }, []);

  return { showNav, toggleNav };
}
