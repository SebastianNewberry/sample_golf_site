'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { initializeJuniorRegistration } from '@/app/actions/junior-registration';

// Zod schema for junior series registration
const juniorSeriesRegistrationSchema = z.object({
  // Parent/Guardian Information
  primaryContactFirstName: z.string().min(1, 'First name is required'),
  primaryContactLastName: z.string().min(1, 'Last name is required'),
  primaryContactEmail: z.string().email('Invalid email address'),
  primaryContactPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  phoneType: z.enum(['mobile', 'home', 'work']),
  preferredContactMethod: z.enum(['text', 'email']),

  // Child Information
  childFirstName: z.string().min(1, 'Child first name is required'),
  childLastName: z.string().min(1, 'Child last name is required'),
  childAge: z.number().min(5, 'Child must be at least 5 years old').max(18, 'Child must be under 19 years old'),
  childExperienceLevel: z.string().min(1, 'Experience level is required'),
  hasOwnClubs: z.boolean(),
  friendsToGroupWith: z.string().optional(),
  additionalComments: z.string().optional(),

  // Program Information
  programId: z.string().uuid('Invalid program ID'),
  programSessionId: z.string().uuid('Invalid session ID').optional().or(z.literal('')),
});

type JuniorSeriesRegistrationFormValues = z.infer<typeof juniorSeriesRegistrationSchema>;

interface JuniorSeriesRegistrationFormProps {
  programId: string;
  programName: string;
  programPrice: number;
  sessions?: { id: string; name: string; startDate: Date; endDate: Date }[];
}

export function JuniorSeriesRegistrationForm({
  programId,
  programName,
  programPrice,
  sessions = [],
}: JuniorSeriesRegistrationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<JuniorSeriesRegistrationFormValues>({
    resolver: zodResolver(juniorSeriesRegistrationSchema),
    defaultValues: {
      primaryContactFirstName: '',
      primaryContactLastName: '',
      primaryContactEmail: '',
      primaryContactPhone: '',
      phoneType: 'mobile',
      preferredContactMethod: 'email',
      childFirstName: '',
      childLastName: '',
      childAge: 0,
      childExperienceLevel: '',
      hasOwnClubs: false,
      friendsToGroupWith: '',
      additionalComments: '',
      programId: programId,
      programSessionId: '',
    },
  });

  const onSubmit = async (data: JuniorSeriesRegistrationFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await initializeJuniorRegistration({
        primaryContactFirstName: data.primaryContactFirstName,
        primaryContactLastName: data.primaryContactLastName,
        primaryContactEmail: data.primaryContactEmail,
        primaryContactPhone: data.primaryContactPhone,
        phoneType: data.phoneType,
        preferredContactMethod: data.preferredContactMethod,
        childFirstName: data.childFirstName,
        childLastName: data.childLastName,
        childAge: data.childAge,
        childExperienceLevel: data.childExperienceLevel,
        hasOwnClubs: data.hasOwnClubs,
        friendsToGroupWith: data.friendsToGroupWith,
        additionalComments: data.additionalComments,
        programId: data.programId,
        programSessionId: data.programSessionId || undefined,
        programPrice: programPrice,
      });

      if (result.success) {
        // Redirect to checkout page with payment intent details
        const checkoutParams = new URLSearchParams({
          clientSecret: result.clientSecret!,
          programName: programName,
          price: programPrice.toString(),
          type: 'junior',
        });

        router.push(`/checkout?${checkoutParams.toString()}`);
      } else {
        setSubmitError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
          {submitError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Primary Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Primary Contact</h3>

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
                  <FormLabel>Primary Contact Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
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
                  <FormLabel>Primary Contact Phone *</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What type of number is this?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mobile" id="mobile" />
                        <label htmlFor="mobile" className="text-sm font-medium cursor-pointer">
                          Mobile
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="home" id="home" />
                        <label htmlFor="home" className="text-sm font-medium cursor-pointer">
                          Home
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="work" id="work" />
                        <label htmlFor="work" className="text-sm font-medium cursor-pointer">
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
                  <FormLabel>Preferred Method of Contact *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="text" />
                        <label htmlFor="text" className="text-sm font-medium cursor-pointer">
                          Text
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <label htmlFor="email" className="text-sm font-medium cursor-pointer">
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

          {/* Child Information Section */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900">What is your child's name?</h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="childFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
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
              name="childAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How old is your child? *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="5"
                      max="18"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                  <FormLabel>What level of experience does your child have? *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1 - No Experience">1 - No Experience</SelectItem>
                      <SelectItem value="2 - Beginner">2 - Beginner</SelectItem>
                      <SelectItem value="3 - Some Experience">3 - Some Experience</SelectItem>
                      <SelectItem value="4 - Intermediate">4 - Intermediate</SelectItem>
                      <SelectItem value="5 - Advanced">5 - Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasOwnClubs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Does your child have their own golf clubs? *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="has-clubs" />
                        <label htmlFor="has-clubs" className="text-sm font-medium cursor-pointer">
                          Yes, they have their own clubs
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="no-clubs" />
                        <label htmlFor="no-clubs" className="text-sm font-medium cursor-pointer">
                          No, they need to borrow clubs
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
                  <FormLabel>
                    Does your child have friends they would like to be grouped together with?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="If yes, please indicate their first and last names."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Additional Comments Section */}
          <div className="space-y-4 pt-6 border-t">
            <FormField
              control={form.control}
              name="additionalComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information you'd like to share with us..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Session Selection (if sessions available) */}
          {sessions.length > 0 && (
            <div className="space-y-4 pt-6 border-t">
              <FormField
                control={form.control}
                name="programSessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Session (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a session" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sessions.map((session) => (
                          <SelectItem key={session.id} value={session.id}>
                            {session.name} ({new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
