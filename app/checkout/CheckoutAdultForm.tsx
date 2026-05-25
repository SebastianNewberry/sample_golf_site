"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";

// Zod schema for adult checkout form
const adultCheckoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  additionalComments: z.string().optional(),
});

export type AdultFormData = z.infer<typeof adultCheckoutSchema>;

interface CheckoutAdultFormProps {
  programId: string;
  programName: string;
  initialData: AdultFormData | null;
  onSubmit: (data: AdultFormData) => void;
  onBack: () => void;
  isLast: boolean;
  isProcessing: boolean;
  primaryFormData?: AdultFormData | null;
  storageKey: string;
  onGoToCart: () => void;
}

export function CheckoutAdultForm({
  programName,
  initialData,
  onSubmit,
  onBack,
  isLast,
  isProcessing,
  primaryFormData,
  storageKey,
  onGoToCart,
}: CheckoutAdultFormProps) {
  const router = useRouter();
  // Normalize initialData to ensure phoneNumber is properly formatted
  const normalizedInitialData = initialData
    ? {
        ...initialData,
        phoneNumber: initialData.phoneNumber
          ? formatPhoneNumber(initialData.phoneNumber)
          : "",
      }
    : null;

  const form = useForm<AdultFormData>({
    resolver: zodResolver(adultCheckoutSchema),
    defaultValues: normalizedInitialData || {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      additionalComments: "",
    },
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      try {
        const allDataString = localStorage.getItem("checkout_form_data");
        if (allDataString) {
          const allData = JSON.parse(allDataString);
          const draftData = allData[storageKey];
          if (draftData) {
            if (draftData.phoneNumber) {
              draftData.phoneNumber = formatPhoneNumber(draftData.phoneNumber);
            }
            Object.keys(draftData).forEach((key) => {
              form.setValue(key as any, draftData[key]);
            });
          }
        }
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, [storageKey, form]);

  // Save changes to localStorage
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (storageKey) {
        try {
          const allDataString = localStorage.getItem("checkout_form_data");
          const allData = allDataString ? JSON.parse(allDataString) : {};
          allData[storageKey] = { ...allData[storageKey], ...value };
          localStorage.setItem("checkout_form_data", JSON.stringify(allData));
        } catch (e) {
          console.error("Failed to save draft", e);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, storageKey]);

  const handleSubmit = (data: AdultFormData) => {
    onSubmit({
      ...data,
      phoneNumber: data.phoneNumber.replace(/\D/g, ""),
    });
  };

  const handleCopyRegistration = () => {
    if (primaryFormData) {
      form.setValue("firstName", primaryFormData.firstName);
      form.setValue("lastName", primaryFormData.lastName);
      form.setValue("email", primaryFormData.email);
      form.setValue("phoneNumber", primaryFormData.phoneNumber);
      // We don't copy specific comments usually, but could if desired
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
        {/* Copy Registration Callout */}
        {primaryFormData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-5 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h4 className="text-green-900 font-semibold mb-1 text-xs">
                Repeat details from previous registration?
              </h4>
              <p className="text-xs text-green-700">
                Registering for another person? You can reuse previous details
                from a previous registration if you don&apos;t have their
                information yet.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyRegistration}
              className="bg-white text-green-700 border-green-300 enabled:hover:bg-green-50 enabled:hover:text-green-800 enabled:hover:border-green-400 whitespace-nowrap shrink-0"
            >
              Copy previous details
            </Button>
          </div>
        )}

        {/* Personal Information Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...field}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional Comments Section */}
        <div className="space-y-4 pt-4 border-t">
          <FormField
            control={form.control}
            name="additionalComments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Comments (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information you'd like to share with us..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
              className="w-full sm:flex-1 border-green-600 text-green-700 enabled:hover:bg-green-50 enabled:hover:text-green-800 cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full sm:flex-1 bg-green-700 enabled:hover:bg-green-800 text-white cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isLast ? (
                <>
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next Registration
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onGoToCart}
            className="w-full text-green-700 hover:text-green-800 hover:bg-green-50 mt-1 enabled:hover:text-green-800"
          >
            Back to Review Cart
          </Button>
        </div>
      </form>
    </Form>
  );
}
