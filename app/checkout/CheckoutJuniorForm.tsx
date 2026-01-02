"use client";

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

// Zod schema for junior checkout form
const juniorCheckoutSchema = z.object({
  // Parent/Guardian Information
  primaryContactFirstName: z.string().min(1, "First name is required"),
  primaryContactLastName: z.string().min(1, "Last name is required"),
  primaryContactEmail: z.string().email("Invalid email address"),
  primaryContactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits"),
  phoneType: z.enum(["mobile", "home", "work"]),
  preferredContactMethod: z.enum(["text", "email"]),

  // Child Information
  childFirstName: z.string().min(1, "Child first name is required"),
  childLastName: z.string().min(1, "Child last name is required"),
  childAge: z
    .number()
    .min(5, "Child must be at least 5 years old")
    .max(18, "Child must be under 19 years old"),
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
}

export function CheckoutJuniorForm({
  programName,
  initialData,
  onSubmit,
  onBack,
  isLast,
  isProcessing,
}: CheckoutJuniorFormProps) {
  const form = useForm<JuniorFormData>({
    resolver: zodResolver(juniorCheckoutSchema),
    defaultValues: initialData || {
      primaryContactFirstName: "",
      primaryContactLastName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      phoneType: "mobile",
      preferredContactMethod: "email",
      childFirstName: "",
      childLastName: "",
      childAge: 0,
      childExperienceLevel: "",
      hasOwnClubs: false,
      friendsToGroupWith: "",
      additionalComments: "",
    },
  });

  const handleSubmit = (data: JuniorFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Primary Contact Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Parent/Guardian Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
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
                  <Input type="tel" placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phoneType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
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
                      className="flex gap-4"
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
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold text-gray-900">
            Child Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="childAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child&apos;s Age *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="5"
                      max="18"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                <FormLabel>Does your child have their own golf clubs?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "true")}
                    defaultValue={field.value ? "true" : "false"}
                    className="flex gap-6"
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
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={isProcessing}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
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
      </form>
    </Form>
  );
}

