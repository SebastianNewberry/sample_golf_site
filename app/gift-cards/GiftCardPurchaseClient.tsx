"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Gift,
  CreditCard,
  Check,
  ArrowLeft,
  Copy,
  CheckCircle2,
  Lock,
  Mail,
} from "lucide-react";
import { purchaseGiftCard } from "@/app/actions/gift-cards";
import { formatPrice } from "@/lib/utils";
import { SafeHTML } from "@/app/components/SafeHTML";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface ProgramSuggestion {
  id: string;
  name: string;
  type: string;
  price: string;
  description: string;
  pricingOptions?: any;
}

// ============================================
// STEP 1: Amount Selection + Details
// ============================================
export interface GiftCardFormData {
  amount: number | null;
  customAmount: string;
  name: string;
  email: string;
  recipientEmail: string;
  isForSomeoneElse: boolean;
}
function StepOne({
  onNext,
  formData,
  setFormData,
}: {
  onNext: (data: {
    amount: number;
    name: string;
    email: string;
    recipientEmail?: string;
  }) => void;
  formData: GiftCardFormData;
  setFormData: React.Dispatch<React.SetStateAction<GiftCardFormData>>;
}) {
  const { amount, customAmount, name, email, recipientEmail, isForSomeoneElse } = formData;
  const [programs, setPrograms] = useState<ProgramSuggestion[]>([]);

  const presetAmounts = [50, 100, 150, 200, 500];

  useEffect(() => {
    fetch("/api/gift-cards/programs")
      .then((r) => r.json())
      .then((data) => setPrograms(data))
      .catch(() => {});
  }, []);

  const getMatchingPrograms = (amt: number) => {
    let flattened: ProgramSuggestion[] = [];

    for (const p of programs) {
      if (p.pricingOptions) {
        let options: any[] = [];
        try {
          options =
            typeof p.pricingOptions === "string"
              ? JSON.parse(p.pricingOptions)
              : p.pricingOptions;
        } catch (e) {}

        // Filter affordable options, then deduplicate:
        // for the same duration+type, keep only the highest-session-count option.
        const affordableOptions = options.filter(
          (opt: any) => parseFloat(opt.price) <= amt,
        );

        // Group by type key and keep the best (most sessions) per group
        const bestByKey = new Map<string, any>();
        for (const opt of affordableOptions) {
          const key = opt.isOnCourse
            ? `oncourse-${opt.playersCount ?? 1}`
            : `lesson-${opt.durationMinutes ?? 60}`;
          const existing = bestByKey.get(key);
          if (!existing || (opt.sessionCount ?? 1) > (existing.sessionCount ?? 1)) {
            bestByKey.set(key, opt);
          }
        }

        const dedupedOptions = Array.from(bestByKey.values()).sort(
          (a, b) => parseFloat(b.price) - parseFloat(a.price),
        );

        for (const opt of dedupedOptions) {
          let desc: string;
          if (opt.isOnCourse) {
            const playerLabel =
              opt.playersCount > 1
                ? `${opt.playersCount} Players`
                : "1 Player";
            const coachLabel =
              opt.coachesCount && opt.coachesCount > 1
                ? `, ${opt.coachesCount} Coaches`
                : "";
            desc = `On-Course Coaching — ${playerLabel}${coachLabel}`;
          } else {
            const mins = opt.durationMinutes || 60;
            const sessionLabel =
              opt.sessionCount > 1
                ? `${opt.sessionCount} Sessions`
                : "1 Session";
            desc = `${mins} Minutes — ${sessionLabel}`;
          }

          flattened.push({
            ...p,
            id: `${p.id}-${opt.id || opt.title}`,
            name: `${p.name}`,
            price: opt.price.toString(),
            description: desc,
          });
        }
      } else {
        if (parseFloat(p.price) <= amt) {
          flattened.push(p);
        }
      }
    }

    return flattened.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  };

  const selectedAmount =
    amount ?? (customAmount ? parseFloat(customAmount) : 0);
  const matchingPrograms =
    selectedAmount > 0 ? getMatchingPrograms(selectedAmount) : [];

  const isValid =
    selectedAmount >= 10 &&
    selectedAmount <= 1000 &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    email.includes("@") &&
    (!isForSomeoneElse ||
      (recipientEmail.trim().length > 0 && recipientEmail.includes("@")));

  return (
    <div className="space-y-8">
      {/* Amount Selection */}
      <div>
        <h3 className="text-lg font-semibold text-[hsl(var(--golf-green-dark))] mb-4">
          Select an Amount
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setFormData({ ...formData, amount: preset, customAmount: preset.toString() });
              }}
              className={`relative py-3 px-2 rounded-xl border w-full flex items-center justify-center font-bold text-base tracking-tight cursor-pointer transition-colors ${
                selectedAmount === preset
                  ? "border-[hsl(var(--golf-orange))] bg-[hsl(var(--golf-orange))]/5 text-[hsl(var(--golf-orange))]"
                  : "border-gray-200 bg-white hover:border-[hsl(var(--golf-orange))]/40 text-gray-800"
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Or enter a custom amount ($10 - $1,000)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <Input
              type="number"
              min={10}
              max={1000}
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => {
                setFormData({ ...formData, customAmount: e.target.value, amount: null });
              }}
              className="pl-7"
            />
          </div>
        </div>
      </div>

      {/* Purchaser Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[hsl(var(--golf-green-dark))]">
          Your Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Full Name *
            </label>
            <Input
              placeholder="John Doe"
              value={name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email Address *
            </label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        {/* Recipient Toggle */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isForSomeoneElse}
              onChange={(e) => setFormData({ ...formData, isForSomeoneElse: e.target.checked })}
              className="rounded border-gray-300 text-[hsl(var(--golf-orange))] focus:ring-[hsl(var(--golf-orange))]"
            />
            <span className="text-sm text-gray-700">
              This is a gift for someone else
            </span>
          </label>
        </div>

        {isForSomeoneElse && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Recipient&apos;s Email *
            </label>
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              The gift card code will also be sent to this email.
            </p>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <Button
        onClick={() =>
          onNext({
            amount: selectedAmount,
            name: name.trim(),
            email: email.trim(),
            recipientEmail: isForSomeoneElse
              ? recipientEmail.trim()
              : undefined,
          })
        }
        disabled={!isValid}
        className="w-full h-12 text-base font-semibold bg-[hsl(var(--golf-orange))] hover:bg-[hsl(var(--golf-orange))]/90"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        Continue to Payment
      </Button>

      {/* Program Suggestions */}
      {matchingPrograms.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm font-bold text-[hsl(var(--golf-green-dark))] mb-4 tracking-wider">
            Can be used for:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchingPrograms.map((p) => {
              const getProgramInfo = (name: string, type: string) => {
                const n = name.trim();
                if (type === "adult") {
                  if (n.includes("Level II") || n.includes("Level 2"))
                    return {
                      slug: "get-golf-ready-level-2",
                      img: "/golf_ready_level2.webp",
                    };
                  if (n.includes("Level I") || n.includes("Level 1"))
                    return {
                      slug: "get-golf-ready-level-1",
                      img: "/golf_ready_level1.webp",
                    };
                  if (n.includes("Women"))
                    return { slug: "women", img: "/golf_for_women.webp" };
                  if (n.includes("Short Game"))
                    return {
                      slug: "short-game",
                      img: "/adult_short_game.webp",
                    };
                  if (n.includes("Open Practice"))
                    return {
                      slug: "open-practice",
                      img: "/adult_open_practice.webp",
                    };
                  if (n.includes("Private"))
                    return {
                      slug: "private",
                      img: "/adult_private_instruction.webp",
                    };
                } else {
                  if (n.includes("Beginner"))
                    return {
                      slug: "beginner-series",
                      img: "/junior_beginner_series.webp",
                    };
                  if (n.includes("Developmental Series"))
                    return {
                      slug: "developmental-series",
                      img: "/junior_development_series.gif",
                    };
                  if (n.includes("Golf Camp"))
                    return {
                      slug: "golf-camp",
                      img: "/junior_golf_camp.webp",
                    };
                  if (n.includes("Private"))
                    return {
                      slug: "private-instruction",
                      img: "/junior_private_instruction.webp",
                    };
                  if (n.includes("Developmental Camp"))
                    return {
                      slug: "developmental-camp",
                      img: "/junior_programs.webp",
                    };
                }
                return {
                  slug: n.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  img: "/hero.webp",
                };
              };

              const info = getProgramInfo(p.name, p.type);
              const url = `/${p.type}-programs/${info.slug}`;
              const programImage = info.img;

              const quantity = Math.floor(
                selectedAmount / parseFloat(p.price),
              );

              return (
                <a
                  key={p.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white hover:border-[hsl(var(--golf-orange))]/50 hover:shadow-md transition-all h-full"
                >
                  <div className="w-full h-24 relative bg-gray-50 overflow-hidden p-2">
                    <img
                      src={programImage}
                      alt={p.name}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-[hsl(var(--golf-orange))] transition-colors">
                        {p.name}
                      </h4>
                    </div>
                    <div className="overflow-hidden mb-2" style={{ maxHeight: "3.75rem" }}>
                      <SafeHTML
                        html={
                          p.description ||
                          "The perfect way to improve your golf game."
                        }
                        stripToText
                        className="text-xs text-gray-500 line-clamp-3 text-left"
                      />
                    </div>
                    <div className="mt-auto">
                      <span className="inline-block text-[hsl(var(--golf-green-dark))] text-xs font-bold rounded">
                        {quantity > 1 && (
                          <span className="text-[hsl(var(--golf-orange))]">
                            {quantity}x{" "}
                          </span>
                        )}
                        ${formatPrice(p.price)}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// STEP 2: Payment Form (Stripe Elements)
// ============================================
function PaymentForm({
  onSuccess,
  onBack,
  hasRecipient,
  amount,
}: {
  onSuccess: () => void;
  onBack: () => void;
  hasRecipient: boolean;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/gift-cards`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "An error occurred during payment.");
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to details
      </button>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800 font-medium">
        <p>
          {hasRecipient
            ? "Both you and the recipient will receive an email with a code to activate this gift card."
            : "You will receive an email with a code to activate this gift card."}
        </p>
      </div>

      <div className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-100">
          <div>
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-[hsl(var(--golf-green-dark))]" />
              Secure Payment
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              You are purchasing a ${formatPrice(amount)} gift card
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Due</p>
            <p className="text-2xl font-bold text-green-700">${formatPrice(amount)}</p>
          </div>
        </div>
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full h-12 text-base font-semibold bg-[hsl(var(--golf-orange))] hover:bg-[hsl(var(--golf-orange))]/90"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          "Complete Purchase"
        )}
      </Button>
    </form>
  );
}

// ============================================
// STEP 3: Success Screen
// ============================================
function SuccessScreen({ code, amount }: { code: string; amount: number }) {
  const [copied, setCopied] = useState(false);

  const formattedCode = `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-center space-y-8 py-10">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 ring-8 ring-green-50/50">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          Gift Card Purchased!
        </h2>
        <p className="text-lg text-gray-600">
          A confirmation email has been sent with your gift card code.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-[hsl(var(--golf-green-dark))] to-[hsl(var(--golf-green))] rounded-2xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[hsl(var(--golf-orange))] to-transparent opacity-80" />

          <p className="relative z-10 m-0 text-white/80 text-xs uppercase tracking-[0.2em] mb-3 font-medium drop-shadow-sm">
            Gift Card Code
          </p>

          <div className="relative z-10 flex items-center justify-center gap-3 mb-8">
            <span className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-white drop-shadow-md">
              {formattedCode}
            </span>
          </div>

          <div className="relative z-10 inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-8 py-3 shadow-inner">
            <p className="m-0 text-white text-4xl font-bold tracking-tight drop-shadow-md">
              {formatPrice(amount.toString())}
            </p>
          </div>

          {/* Copy Button */}
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={handleCopy}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all hover:scale-110 active:scale-95 shadow-sm"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-300" />
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
        Use this code at checkout on{" "}
        <strong className="text-gray-700 font-medium tracking-tight">
          toskigolfacademy.com
        </strong>{" "}
        to apply it as a credit toward any program or private lesson.
      </p>
    </div>
  );
}

// ============================================
// MAIN CLIENT COMPONENT
// ============================================
export default function GiftCardPurchaseClient() {
  const [formData, setFormData] = useState<GiftCardFormData>({
    amount: null,
    customAmount: "",
    name: "",
    email: "",
    recipientEmail: "",
    isForSomeoneElse: false,
  });
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRecipient, setHasRecipient] = useState(false);

  const handleStepOneComplete = async (data: {
    amount: number;
    name: string;
    email: string;
    recipientEmail?: string;
  }) => {
    setIsCreating(true);
    setError(null);

    try {
      const result = await purchaseGiftCard({
        amount: data.amount,
        purchaserName: data.name,
        purchaserEmail: data.email,
        recipientEmail: data.recipientEmail,
      });

      if ("error" in result && result.error) {
        setError(result.error);
        setIsCreating(false);
        return;
      }

      if (result.clientSecret && result.code) {
        setClientSecret(result.clientSecret);
        setGiftCardCode(result.code);
        setPurchaseAmount(data.amount);
        setHasRecipient(!!data.recipientEmail);
        setStep(2);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      {/* Hero */}
      <div className="relative bg-[#0a1a10] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--golf-green-dark))] to-[#0a1a10] opacity-90" />
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-[0.08]" />

        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[hsl(var(--golf-green))] rounded-full blur-[120px] opacity-20 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 text-center z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-md mb-8 border border-white/20 shadow-2xl">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight drop-shadow-md">
            Gift Cards
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-xl mx-auto font-light tracking-wide leading-relaxed">
            The perfect gift for golfers of all skill levels. Redeemable for any
            program or private lesson at Toski Golf Academy.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-16 sm:-mt-20 pb-24 relative z-10">
        <Card className="shadow-2xl border-0 overflow-hidden ring-1 ring-black/5 rounded-2xl bg-white/95 backdrop-blur-md">
          {/* Step Indicator */}
          {step < 3 && (
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        step >= s
                          ? "bg-[hsl(var(--golf-orange))] text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step > s ? <Check className="w-4 h-4" /> : s}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        step >= s ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {s === 1 ? "Details" : "Payment"}
                    </span>
                    {s < 2 && (
                      <div className="w-12 h-0.5 bg-gray-200 mx-1">
                        <div
                          className={`h-full transition-all ${
                            step > s
                              ? "bg-[hsl(var(--golf-orange))] w-full"
                              : "w-0"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {isCreating && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <span className="w-8 h-8 border-3 border-[hsl(var(--golf-orange))] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">
                    Setting up your gift card...
                  </p>
                </div>
              </div>
            )}

            {!isCreating && step === 1 && (
              <StepOne onNext={handleStepOneComplete} formData={formData} setFormData={setFormData} />
            )}

            {step === 2 && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#e97a2b",
                    },
                  },
                }}
              >
                <PaymentForm
                  onSuccess={() => setStep(3)}
                  onBack={() => {
                    setStep(1);
                    setClientSecret(null);
                  }}
                  hasRecipient={hasRecipient}
                  amount={purchaseAmount}
                />
              </Elements>
            )}

            {step === 3 && (
              <SuccessScreen code={giftCardCode} amount={purchaseAmount} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
