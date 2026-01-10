"use client";

import { useState } from "react";
import { AddToCartButton } from "@/app/components/AddToCartButton";
import { BuyNowButton } from "@/app/components/BuyNowButton";
import { CalendarClock, Phone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Session {
  id: string;
  name: string;
}

interface ProgramPurchaseSectionProps {
  programId: string;
  programName: string;
  programPrice: number;
  duration: string;
  sessions: Session[];
  registrationType?: "adult" | "junior";
  showContactButton?: boolean;
  contactPhone?: string;
  selectedSessionId?: string;
  onSessionChange?: (sessionId: string) => void;
}

export function ProgramPurchaseSection({
  programId,
  programName,
  programPrice,
  duration,
  sessions,
  registrationType = "adult",
  showContactButton = false,
  contactPhone = "(248) 563-3561",
  selectedSessionId: controlledSessionId,
  onSessionChange,
}: ProgramPurchaseSectionProps) {
  const [internalSessionId, setInternalSessionId] = useState<string>("");

  const selectedSession = controlledSessionId ?? internalSessionId;
  const setSelectedSession = onSessionChange ?? setInternalSessionId;

  const hasSessions = sessions.length > 0;
  const isSessionSelected = selectedSession && selectedSession.trim() !== "";

  return (
    <>
      {/* Price Header */}
      <div className="text-center pb-4 border-b border-gray-100 mb-4">
        <p className="text-5xl font-bold text-green-700">
          ${programPrice.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mt-1 font-medium">{duration}</p>
      </div>

      {hasSessions ? (
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Session:
          </label>
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-full bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white">
              <SelectValue placeholder="Choose your dates..." />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-3 text-amber-700">
            <CalendarClock size={20} className="shrink-0" />
            <div>
              <p className="font-semibold">Dates To Be Determined</p>
              <p className="text-sm text-amber-600">
                Check back soon or contact us for more info.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasSessions ? (
        <div className="space-y-3">
          <BuyNowButton
            programId={programId}
            programSessionId={selectedSession || undefined}
            registrationType={registrationType}
            price={programPrice}
            className={`w-full py-3.5 font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all ${
              isSessionSelected
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            size="lg"
            disabled={!isSessionSelected}
          >
            BUY NOW
          </BuyNowButton>

          <AddToCartButton
            programId={programId}
            programSessionId={selectedSession || undefined}
            registrationType={registrationType}
            price={programPrice}
            className={`w-full py-3.5 font-bold text-base border-2 rounded-xl transition-all ${
              isSessionSelected
                ? "bg-green-50 text-green-700 hover:bg-green-200 hover:border-green-700 border-green-600"
                : "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
            }`}
            size="lg"
            disabled={!isSessionSelected}
          >
            ADD TO CART
          </AddToCartButton>

          {showContactButton && (
            <a
              href={`tel:${contactPhone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center justify-center gap-2 w-full py-3 font-semibold text-gray-600 hover:text-green-700 border border-gray-200 rounded-xl hover:border-green-300 transition-all"
            >
              <Phone size={18} />
              Call to Schedule
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <button
            disabled
            className="w-full py-3.5 font-bold text-base bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed"
          >
            BUY NOW
          </button>
          <button
            disabled
            className="w-full py-3.5 font-bold text-base border-2 border-gray-200 text-gray-400 rounded-xl cursor-not-allowed"
          >
            ADD TO CART
          </button>
          <a
            href={`tel:${contactPhone.replace(/[^0-9+]/g, "")}`}
            className="flex items-center justify-center gap-2 w-full py-3 font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all"
          >
            <Phone size={18} />
            Contact Us for Availability
          </a>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-4">
        {hasSessions
          ? isSessionSelected
            ? "Complete registration at checkout"
            : "Please select a session above to continue"
          : "We'll notify you when sessions are available"}
      </p>
    </>
  );
}
