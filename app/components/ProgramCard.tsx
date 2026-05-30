"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { ProgramPurchaseSection } from "@/app/components/ProgramPurchaseSection";
import { SafeHTML } from "@/app/components/SafeHTML";
import {
  programCardImageContainer,
  programCardImageFrame,
  programCardImageFrameTall,
} from "@/app/components/program-page-layout";

interface ProgramCardProps {
  imageUrl?: string;
  alt: string;
  defaultImage: any;
  title: string;
  description: string;
  programId: string;
  programPrice: number;
  duration: string;
  sessions: Array<{ id: string; name: string; startDate?: string | Date }>;
  registrationType: "adult" | "junior";
  selectedSessionId?: string;
  onSessionChange?: (sessionId: string) => void;
  showContactButton?: boolean;
  extraContent?: ReactNode;
  imageClassName?: string;
  /** Golf for Women — taller hero than standard program pages */
  tallImage?: boolean;
  imageFit?: "cover" | "contain";
}

export function ProgramCard({
  imageUrl,
  alt,
  defaultImage,
  title,
  description,
  programId,
  programPrice,
  duration,
  sessions,
  registrationType,
  selectedSessionId,
  onSessionChange,
  showContactButton = false,
  extraContent,
  imageClassName,
  tallImage = false,
  imageFit = "cover",
}: ProgramCardProps) {
  const imageFrame = tallImage
    ? programCardImageFrameTall
    : programCardImageFrame;
  const imageFitClass =
    imageFit === "contain" ? "object-contain" : "object-cover";

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Image */}
      <div className={programCardImageContainer}>
        <div className={imageFrame}>
          <Image
            src={imageUrl || defaultImage}
            alt={alt}
            width={600}
            height={480}
            className={`h-full w-full ${imageFitClass} ${imageClassName || ""}`}
            priority
          />
        </div>
      </div>

      {/* Description and Price below image */}
      <div className="p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-2">{title}</h1>
        <div className="text-gray-700 text-sm leading-relaxed mb-6 [&_p]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mb-1 font-sans">
          <SafeHTML html={description} />
        </div>

        {/* Price & Buttons */}
        <ProgramPurchaseSection
          programId={programId}
          programName={title}
          programPrice={programPrice}
          duration={duration}
          sessions={sessions}
          registrationType={registrationType}
          selectedSessionId={selectedSessionId}
          onSessionChange={onSessionChange}
          showContactButton={showContactButton}
        />

        {/* Extra content after purchase section */}
        {extraContent}
      </div>
    </div>
  );
}
