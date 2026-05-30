import { useCallback, useEffect, useRef } from "react";

/**
 * Desktop mega-menu hover: ignores enter events while scrolling (content moves
 * under a stationary cursor) and briefly after a link click.
 */
export function useNavHoverMenu(options?: { onScroll?: () => void }) {
  const onScrollRef = useRef(options?.onScroll);
  onScrollRef.current = options?.onScroll;

  const hoverEnabledRef = useRef(true);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      hoverEnabledRef.current = false;
      onScrollRef.current?.();
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = setTimeout(() => {
        hoverEnabledRef.current = true;
      }, 250);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    };
  }, []);

  const resetHoverOnLeave = useCallback(() => {
    hoverEnabledRef.current = true;
  }, []);

  const isHoverOpenAllowed = useCallback(
    () => hoverEnabledRef.current,
    [],
  );

  return { isHoverOpenAllowed, resetHoverOnLeave };
}
