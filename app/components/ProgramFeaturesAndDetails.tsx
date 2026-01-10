"use client";

import { CheckCircle2 } from "lucide-react";
import { ProgramDetailsSection } from "./ProgramDetailsSection";
import type { ProgramDetail } from "@/lib/program-details";

interface ProgramFeaturesAndDetailsProps {
  features: string[] | null;
  details: string | any[] | null;
}

export function ProgramFeaturesAndDetails({
  features,
  details,
}: ProgramFeaturesAndDetailsProps) {
  return (
    <>
      {/* Program Features */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Program Features
        </h2>
        <div className="space-y-3">
          {(features || []).map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle2
                className="text-green-600 shrink-0"
                size={20}
              />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Program Details */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Program Details
        </h2>
        <ProgramDetailsSection details={details} />
      </div>
    </>
  );
}

