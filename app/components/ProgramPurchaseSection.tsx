"use client";

import { useState, useEffect } from "react";
import { AddToCartButton } from "@/app/components/AddToCartButton";
import { BuyNowButton } from "@/app/components/BuyNowButton";
import { CalendarClock, Phone, AlertCircle, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { checkSessionAvailability } from "@/app/actions/cart";
import { useCart } from "@/app/components/cart/CartContext";

interface Session {
  id: string;
  name: string;
  startDate?: string | Date;
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
  const [availability, setAvailability] = useState<{
    available: boolean;
    remaining: number;
  } | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const selectedSession = controlledSessionId ?? internalSessionId;
  const setSelectedSession = onSessionChange ?? setInternalSessionId;

  const { items } = useCart();

  // Fetch availability when selected session changes
  useEffect(() => {
    if (selectedSession && selectedSession.trim() !== "") {
      const fetchAvailability = async () => {
        setIsCheckingAvailability(true);
        const result = await checkSessionAvailability(selectedSession);
        if (result.success) {
          setAvailability({
            available: result.available!,
            remaining: result.remaining!,
          });
        }
        setIsCheckingAvailability(false);
      };
      fetchAvailability();
    } else {
      setAvailability(null);
    }
  }, [selectedSession]);

  const hasSessions = sessions.length > 0;
  const isSessionSelected = selectedSession && selectedSession.trim() !== "";

  // Calculate if the session is full considering cart items
  const currentInCart =
    items
      .filter((i) => i.programSessionId === selectedSession)
      .reduce((sum, i) => sum + i.quantity, 0) || 0;

  const isFull = availability ? availability.remaining <= currentInCart : false;
  const isDisabled = !isSessionSelected || isFull || isCheckingAvailability;

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
              {sessions.map((session) => {
                const isStarted = session.startDate ? new Date() > new Date(session.startDate) : false;
                return (
                  <SelectItem key={session.id} value={session.id} disabled={isStarted} className={isStarted ? "text-gray-400" : ""}>
                    {session.name}
                    {isStarted && " (Started)"}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-3 text-amber-700">
            <CalendarClock size={20} className="shrink-0" />
            <div>
              <p className="font-semibold">None Available</p>
              <p className="text-sm text-amber-600">
                There are currently no available sessions.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSessionSelected && availability && (
        <div
          className={`mb-5 p-4 rounded-xl border flex items-start gap-3 ${isFull
              ? "bg-red-50 border-red-200 text-red-700"
              : availability.remaining <= 3
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
        >
          {isFull ? (
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
          ) : (
            <CalendarClock size={20} className="shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold text-sm">
              {isFull
                ? "Session Full"
                : availability.remaining <= 3
                  ? "Limited Availability"
                  : "Spots Available"}
            </p>
            <p className="text-xs mt-0.5 font-medium opacity-90">
              {isFull
                ? currentInCart > 0
                  ? `You have ${currentInCart} ${currentInCart === 1 ? "spot" : "spots"} in your cart, which fills the remaining capacity.`
                  : "All spots for this session have been booked."
                : `${availability.remaining - currentInCart} ${availability.remaining - currentInCart === 1
                  ? "spot remains"
                  : "spots remain"
                }${currentInCart > 0 ? ` (${currentInCart} in cart)` : ""}`}
            </p>
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
            className={`w-full py-3.5 font-bold text-base rounded-xl shadow-md enabled:hover:shadow-lg transition-all ${!isDisabled
                ? "bg-orange-500 enabled:hover:bg-orange-600 text-white"
                : "bg-gray-200 text-gray-400"
              }`}
            size="lg"
            disabled={isDisabled}
          >
            BUY NOW
          </BuyNowButton>

          <AddToCartButton
            programId={programId}
            programSessionId={selectedSession || undefined}
            registrationType={registrationType}
            price={programPrice}
            className={`w-full py-3.5 font-bold text-base border-2 rounded-xl transition-all ${!isDisabled
                ? "bg-green-50 text-green-700 enabled:hover:bg-green-200 enabled:hover:border-green-700 border-green-600"
                : "border-gray-200 text-gray-400 bg-gray-50"
              }`}
            size="lg"
            disabled={isDisabled}
          >
            ADD TO CART
          </AddToCartButton>

          {showContactButton && (
            <a
              href={`tel:${contactPhone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center justify-center gap-2 w-full py-3 font-semibold text-gray-600 hover:text-green-700 border border-gray-200 rounded-xl hover:border-green-300 transition-all cursor-pointer"
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
            ? isCheckingAvailability
              ? "Checking availability..."
              : isFull
                ? "This session is currently at capacity"
                : "Complete registration at checkout"
            : "Please select a session above to continue"
          : "We'll notify you when sessions are available"}
      </p>
    </>
  );
}
