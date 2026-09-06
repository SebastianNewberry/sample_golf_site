"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactNode } from "react";

export function DisabledActionTooltip({
  reason,
  children,
}: {
  reason: string;
  children: ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <div className="w-full cursor-not-allowed">{children}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="pointer-events-none">
          <p>{reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
