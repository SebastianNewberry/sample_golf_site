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
  reason: string | null;
  children: ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip disableHoverableContent open={reason ? undefined : false}>
        <TooltipTrigger asChild>
          <div className={reason ? "w-full cursor-not-allowed" : "w-full"}>
            {children}
          </div>
        </TooltipTrigger>
        {reason && (
          <TooltipContent side="bottom" className="pointer-events-none">
            <p>{reason}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
