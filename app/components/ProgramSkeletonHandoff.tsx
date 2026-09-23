"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Snapshot the skeleton when it unmounts and fade that snapshot out.
 * The incoming page fades in on its own, so this is one crossfade —
 * the skeleton never fades in.
 */
export function ProgramSkeletonHandoff({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    return () => {
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rect = el.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return;

      const clone = el.cloneNode(true) as HTMLElement;
      clone.removeAttribute("data-program-skeleton");
      clone.style.position = "absolute";
      clone.style.top = `${rect.top + window.scrollY}px`;
      clone.style.left = `${rect.left + window.scrollX}px`;
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.margin = "0";
      clone.style.zIndex = "30";
      clone.style.pointerEvents = "none";
      clone.style.overflow = "hidden";

      const remove = () => clone.remove();
      window.requestAnimationFrame(() => {
        if (document.querySelector("[data-program-skeleton]")) return;
        document.body.appendChild(clone);
        clone.classList.add("program-page-leave");
        clone.addEventListener("animationend", remove);
        window.setTimeout(remove, 250);
      });
    };
  }, []);

  return (
    <div ref={ref} data-program-skeleton>
      {children}
    </div>
  );
}
