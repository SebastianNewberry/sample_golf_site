"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { ProgramPurchaseSection } from "@/app/components/ProgramPurchaseSection";
import { SafeHTML } from "@/app/components/SafeHTML";

interface ProgramCardProps {
  imageUrl?: string;
  alt: string;
  defaultImage: any;
  title: string;
  description: string[];
  programId: string;
  programPrice: number;
  duration: string;
  sessions: Array<{ id: string; name: string }>;
  registrationType: "adult" | "junior";
  selectedSessionId?: string;
  onSessionChange?: (sessionId: string) => void;
  showContactButton?: boolean;
  extraContent?: ReactNode;
  imageClassName?: string;
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
}: ProgramCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Image */}
      <div className="relative w-full">
        <Image
          src={imageUrl || defaultImage}
          alt={alt}
          width={600}
          height={400}
          className={`w-full max-h-[400px] object-cover bg-gray-100 ${imageClassName || ""}`}
          priority
        />
      </div>

      {/* Description and Price below image */}
      <div className="p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-2">{title}</h1>
        {description.map((paragraph, index) => (
          <p
            key={index}
            className={`${
              index === 0 ? "text-gray-700" : "text-gray-600"
            } text-sm leading-relaxed mb-2`}
          >
            <SafeHTML html={paragraph} />
          </p>
        ))}

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
