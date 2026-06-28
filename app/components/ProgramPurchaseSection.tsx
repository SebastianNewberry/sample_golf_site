"use client";

import { useState, useEffect } from "react";
import { AddToCartButton } from "@/app/components/AddToCartButton";
import { BuyNowButton } from "@/app/components/BuyNowButton";
import { QuantitySelect } from "@/app/components/QuantitySelect";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { formatPrice } from "@/lib/utils";

interface Session {
  id: string;
  name: string;
  startDate?: string | Date;
  isBooked?: boolean;
}

function isSessionUnavailable(session: Session): boolean {
  const isStarted = session.startDate
    ? new Date() > new Date(session.startDate)
    : false;
  return isStarted || (session.isBooked ?? false);
}

function sortSessionsAvailableFirst(sessions: Session[]): Session[] {
  return [...sessions].sort((a, b) => {
    const aUnavailable = isSessionUnavailable(a);
    const bUnavailable = isSessionUnavailable(b);
    if (aUnavailable === bUnavailable) return 0;
    return aUnavailable ? 1 : -1;
  });
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
  const [quantity, setQuantity] = useState(1);
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
  const allSessionsUnavailable = hasSessions && sessions.every((s) => isSessionUnavailable(s));
  const isSessionSelected = selectedSession && selectedSession.trim() !== "";

  // Calculate if the session is full considering cart items
  const currentInCart =
    items
      .filter((i) => i.programSessionId === selectedSession)
      .reduce((sum, i) => sum + i.quantity, 0) || 0;

  const maxQuantity = availability
    ? Math.max(0, availability.remaining - currentInCart)
    : 0;

  const selectedSessionMeta = sessions.find((s) => s.id === selectedSession);
  const selectedSessionUnavailable = selectedSessionMeta
    ? isSessionUnavailable(selectedSessionMeta)
    : false;

  const isFull =
    maxQuantity <= 0 && isSessionSelected && !isCheckingAvailability;
  const isDisabled =
    !isSessionSelected ||
    isFull ||
    isCheckingAvailability ||
    selectedSessionUnavailable;

  const isQuantityDisabled = isDisabled || maxQuantity <= 0;

  // Reset quantity when session or available spots change
  useEffect(() => {
    if (maxQuantity <= 0) {
      setQuantity(1);
      return;
    }
    setQuantity((prev) => (prev > maxQuantity ? maxQuantity : prev < 1 ? 1 : prev));
  }, [selectedSession, maxQuantity]);

  return (
    <>
      {/* Price Header */}
      <div className="text-center pb-4 border-b border-gray-100 mb-4">
        <p className="text-5xl font-bold text-green-700">
          ${formatPrice(programPrice)}
        </p>
        <p className="text-sm text-gray-500 mt-1 font-medium">{duration}</p>
      </div>

      {hasSessions && !allSessionsUnavailable && (
        <div className="mb-5">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Session:
              </label>
              <Select
                value={selectedSession}
                onValueChange={setSelectedSession}
              >
                <SelectTrigger className="w-full bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white">
                  <SelectValue placeholder="Choose your dates..." />
                </SelectTrigger>
                <SelectContent>
                  {sortSessionsAvailableFirst(sessions).map((session) => {
                    const isStarted = session.startDate
                      ? new Date() > new Date(session.startDate)
                      : false;
                    const isBooked = session.isBooked ?? false;
                    const unavailable = isSessionUnavailable(session);
                    return (
                      <SelectItem
                        key={session.id}
                        value={session.id}
                        disabled={unavailable}
                        className={unavailable ? "text-gray-400" : ""}
                      >
                        {session.name}
                        {isStarted && " (Started)"}
                        {!isStarted && isBooked && " (Sold Out)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24 shrink-0">
              <label
                htmlFor="quantity"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Quantity:
              </label>
              <QuantitySelect
                inline
                value={quantity}
                onChange={setQuantity}
                maxQuantity={Math.max(maxQuantity, 1)}
                disabled={isQuantityDisabled}
              />
            </div>
          </div>
        </div>
      )}

      {isSessionSelected && availability && (
        <div
          className={`mb-5 p-4 rounded-xl border flex items-start gap-3 ${
            isFull
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
                : `${availability.remaining - currentInCart} ${
                    availability.remaining - currentInCart === 1
                      ? "spot remains"
                      : "spots remain"
                  }${currentInCart > 0 ? ` (${currentInCart} in cart)` : ""}`}
            </p>
          </div>
        </div>
      )}

      {hasSessions ? (
        <div className="space-y-3">
          {isDisabled && (!isSessionSelected || allSessionsUnavailable) ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <div className="w-full cursor-not-allowed">
                    <BuyNowButton
                      programId={programId}
                      programSessionId={selectedSession || undefined}
                      registrationType={registrationType}
                      price={programPrice}
                      quantity={quantity}
                      className="w-full py-3.5 font-bold text-base rounded-xl shadow-md transition-all bg-gray-200 text-gray-400 pointer-events-none"
                      size="lg"
                      disabled={isDisabled}
                    >
                      BUY NOW
                    </BuyNowButton>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="pointer-events-none">
                  <p>{allSessionsUnavailable ? "No sessions currently available" : "Please select a session from the dropdown above"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <BuyNowButton
              programId={programId}
              programSessionId={selectedSession || undefined}
              registrationType={registrationType}
              price={programPrice}
              quantity={quantity}
              className={`w-full py-3.5 font-bold text-base rounded-xl shadow-md enabled:hover:shadow-lg transition-all ${
                !isDisabled
                  ? "bg-orange-500 enabled:hover:bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
              size="lg"
              disabled={isDisabled}
            >
              BUY NOW
            </BuyNowButton>
          )}

          {isDisabled && (!isSessionSelected || allSessionsUnavailable) ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <div className="w-full cursor-not-allowed">
                    <AddToCartButton
                      programId={programId}
                      programSessionId={selectedSession || undefined}
                      registrationType={registrationType}
                      price={programPrice}
                      quantity={quantity}
                      className="w-full py-3.5 font-bold text-base border-2 rounded-xl transition-all border-gray-200 text-gray-400 bg-gray-50 pointer-events-none"
                      size="lg"
                      disabled={isDisabled}
                    >
                      ADD TO CART
                    </AddToCartButton>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="pointer-events-none">
                  <p>{allSessionsUnavailable ? "No sessions currently available" : "Please select a session from the dropdown above"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <AddToCartButton
              programId={programId}
              programSessionId={selectedSession || undefined}
              registrationType={registrationType}
              price={programPrice}
              quantity={quantity}
              className={`w-full py-3.5 font-bold text-base border-2 rounded-xl transition-all ${
                !isDisabled
                  ? "bg-green-50 text-green-700 enabled:hover:bg-green-200 enabled:hover:border-green-700 border-green-600"
                  : "border-gray-200 text-gray-400 bg-gray-50"
              }`}
              size="lg"
              disabled={isDisabled}
            >
              ADD TO CART
            </AddToCartButton>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <TooltipProvider delayDuration={0}>
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <div className="w-full cursor-not-allowed">
                  <button
                    disabled
                    className="w-full py-3.5 font-bold text-base bg-gray-200 text-gray-400 rounded-xl pointer-events-none"
                  >
                    BUY NOW
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="pointer-events-none">
                <p>No sessions currently available</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <div className="w-full cursor-not-allowed">
                  <button
                    disabled
                    className="w-full py-3.5 font-bold text-base border-2 border-gray-200 text-gray-400 rounded-xl pointer-events-none"
                  >
                    ADD TO CART
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="pointer-events-none">
                <p>No sessions currently available</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Call Option */}
      <div className="mt-8 pt-6 border-t flex flex-col items-center justify-center text-center">
        <span className="text-sm text-gray-500 mb-3 bg-white px-3 -mt-9">
          OR
        </span>
        <a
          href="tel:+12485633561"
          className="flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors font-medium cursor-pointer"
        >
          <Phone className="w-4 h-4" />
          Call to Schedule: (248) 563-3561
        </a>
      </div>


    </>
  );
}
