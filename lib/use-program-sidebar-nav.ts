import { useCallback, useEffect, useState } from "react";

/** Mobile program sidebar: closes on scroll and after choosing a link. */
export function useProgramSidebarNav() {
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const closeOnScroll = () => setShowNav(false);
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, []);

  const toggleNav = useCallback(() => setShowNav((open) => !open), []);
  const closeNav = useCallback(() => setShowNav(false), []);

  return { showNav, toggleNav, closeNav };
}
