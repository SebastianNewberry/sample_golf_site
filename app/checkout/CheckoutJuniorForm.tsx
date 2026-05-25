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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";

// Zod schema for junior checkout form
const juniorCheckoutSchema = z.object({
  // Parent/Guardian Information
  primaryContactFirstName: z.string().min(1, "First name is required"),
  primaryContactLastName: z.string().min(1, "Last name is required"),
  primaryContactEmail: z.email("Invalid email address"),
  primaryContactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits"),
  phoneType: z.enum(["mobile", "home", "work"]),
  preferredContactMethod: z.enum(["text", "email"]),

  // Child Information
  childFirstName: z.string().min(1, "Child first name is required"),
  childLastName: z.string().min(1, "Child last name is required"),
  childAge: z
    .string()
    .refine((val) => val === "" || !isNaN(Number(val)), {
      message: "Must be a valid number",
    })
    .refine((val) => val === "" || Number(val) >= 4, {
      message: "Child must be at least 4 years old",
    })
    .refine((val) => val === "" || Number(val) <= 18, {
      message: "Child must be under 19 years old",
    }),
  childExperienceLevel: z.string().min(1, "Experience level is required"),
  hasOwnClubs: z.boolean(),
  friendsToGroupWith: z.string().optional(),
  additionalComments: z.string().optional(),
});

export type JuniorFormData = z.infer<typeof juniorCheckoutSchema>;

interface CheckoutJuniorFormProps {
  programId: string;
  programName: string;
  initialData: JuniorFormData | null;
  onSubmit: (data: JuniorFormData) => void;
  onBack: () => void;
  isLast: boolean;
  isProcessing: boolean;
  primaryFormData?: JuniorFormData | null;
  storageKey: string;
  onGoToCart: () => void;
}

export function CheckoutJuniorForm({
  programName,
  initialData,
  onSubmit,
  onBack,
  isLast,
  isProcessing,
  primaryFormData,
  storageKey,
  onGoToCart,
}: CheckoutJuniorFormProps) {
  const router = useRouter();
  // Normalize initialData to ensure childAge is always a string for the form
  const normalizedInitialData = initialData
    ? {
        ...initialData,
        childAge:
          initialData.childAge == null || Number(initialData.childAge) === 0
            ? ""
            : String(initialData.childAge),
        primaryContactPhone: initialData.primaryContactPhone
          ? formatPhoneNumber(initialData.primaryContactPhone)
          : "",
      }
    : null;

  const form = useForm<JuniorFormData>({
    resolver: zodResolver(juniorCheckoutSchema),
    defaultValues: normalizedInitialData || {
      primaryContactFirstName: "",
      primaryContactLastName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      phoneType: "mobile",
      preferredContactMethod: "email",
      childFirstName: "",
      childLastName: "",
      childAge: "",
      childExperienceLevel: "",
      hasOwnClubs: false,
      friendsToGroupWith: "",
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
            // Normalize childAge to string before restoring
            if (draftData.childAge != null) {
              draftData.childAge =
                Number(draftData.childAge) === 0
                  ? ""
                  : String(draftData.childAge);
            }
            if (draftData.primaryContactPhone) {
              draftData.primaryContactPhone = formatPhoneNumber(
                draftData.primaryContactPhone,
              );
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

  const handleSubmit = (data: JuniorFormData) => {
    // Parse childAge to number and format phone number before submission
    const formattedData = {
      ...data,
      childAge: parseInt(data.childAge as string, 10),
      primaryContactPhone: data.primaryContactPhone.replace(/\D/g, ""),
    };
    onSubmit(formattedData as any); // Cast to any to bypass TS error as parent component handles it
  };

  const handleCopyParentInfo = () => {
    if (primaryFormData) {
      form.setValue(
        "primaryContactFirstName",
        primaryFormData.primaryContactFirstName,
      );
      form.setValue(
        "primaryContactLastName",
        primaryFormData.primaryContactLastName,
      );
      form.setValue("primaryContactEmail", primaryFormData.primaryContactEmail);
      form.setValue("primaryContactPhone", primaryFormData.primaryContactPhone);
      form.setValue("phoneType", primaryFormData.phoneType);
      form.setValue(
        "preferredContactMethod",
        primaryFormData.preferredContactMethod,
      );

      // Copy Child Info
      form.setValue("childFirstName", primaryFormData.childFirstName);
      form.setValue("childLastName", primaryFormData.childLastName);
      // Ensure childAge is set as a string in the form
      form.setValue(
        "childAge",
        Number(primaryFormData.childAge) === 0
          ? ""
          : String(primaryFormData.childAge),
      );
      form.setValue(
        "childExperienceLevel",
        primaryFormData.childExperienceLevel,
      );
      form.setValue("hasOwnClubs", primaryFormData.hasOwnClubs);
      // We generally don't copy friends grouping as that might differ per child
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
        {/* Copy Parent Info Callout */}
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
              onClick={handleCopyParentInfo}
              className="bg-white text-green-700 border-green-300 enabled:hover:bg-green-50 enabled:hover:text-green-800 enabled:hover:border-green-400 whitespace-nowrap shrink-0"
            >
              Copy Previous Details
            </Button>
          </div>
        )}

        {/* Primary Contact Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Parent/Guardian Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="primaryContactFirstName"
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
              name="primaryContactLastName"
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
            name="primaryContactEmail"
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
            name="primaryContactPhone"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="phoneType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mobile" id="mobile" />
                        <label
                          htmlFor="mobile"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Mobile
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="home" id="home" />
                        <label
                          htmlFor="home"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Home
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="work" id="work" />
                        <label
                          htmlFor="work"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Work
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredContactMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Contact</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="text" />
                        <label
                          htmlFor="text"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Text
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email-method" />
                        <label
                          htmlFor="email-method"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Email
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Child Information Section */}
        <div className="space-y-3 sm:space-y-4 pt-4 border-t">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Child Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="childFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child&apos;s First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="childLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child&apos;s Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="childAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child&apos;s Age *</FormLabel>
                  <FormControl>
                      <Input
                        type="number"
                        min="4"
                        max="18"
                        placeholder=""
                        className="bg-white"
                        {...field}
                        value={field.value} // childAge is now a string, so no need for || ""
                        onChange={(e) => field.onChange(e.target.value)} // Keep it as a string in the form state
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="childExperienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1 - No Experience">
                        1 - No Experience
                      </SelectItem>
                      <SelectItem value="2 - Beginner">2 - Beginner</SelectItem>
                      <SelectItem value="3 - Some Experience">
                        3 - Some Experience
                      </SelectItem>
                      <SelectItem value="4 - Intermediate">
                        4 - Intermediate
                      </SelectItem>
                      <SelectItem value="5 - Advanced">5 - Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="hasOwnClubs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Does your child have their own golf clubs?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                    className="flex flex-wrap gap-4 sm:gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="has-clubs" />
                      <label
                        htmlFor="has-clubs"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="no-clubs" />
                      <label
                        htmlFor="no-clubs"
                        className="text-sm font-medium cursor-pointer"
                      >
                        No, needs to borrow
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="friendsToGroupWith"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Friends to group with (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Names of friends they'd like to be grouped with"
                    {...field}
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
                    placeholder="Any additional information you'd like to share..."
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
