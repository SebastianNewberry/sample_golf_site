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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { initializeAdultRegistration } from '@/app/actions/adult-registration';

// Zod schema for adult program registration
const adultProgramRegistrationSchema = z.object({
  // User Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),

  // Program Information
  programId: z.string().uuid('Invalid program ID'),
  programSessionId: z.string().uuid('Invalid session ID').optional().or(z.literal('')),
  additionalComments: z.string().optional(),
});

type AdultProgramRegistrationFormValues = z.infer<typeof adultProgramRegistrationSchema>;

interface AdultProgramRegistrationFormProps {
  programId: string;
  programName: string;
  programPrice: number;
  sessions?: { id: string; name: string; startDate: Date; endDate: Date }[];
}

export function AdultProgramRegistrationForm({
  programId,
  programName,
  programPrice,
  sessions = [],
}: AdultProgramRegistrationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<AdultProgramRegistrationFormValues>({
    resolver: zodResolver(adultProgramRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      programId: programId,
      programSessionId: '',
      additionalComments: '',
    },
  });

  const onSubmit = async (data: AdultProgramRegistrationFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await initializeAdultRegistration({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        programId: data.programId,
        programSessionId: data.programSessionId || undefined,
        additionalComments: data.additionalComments,
        programPrice: programPrice,
      });

      if (result.success) {
        // Redirect to checkout page with payment intent details
        const checkoutParams = new URLSearchParams({
          clientSecret: result.clientSecret!,
          programName: programName,
          price: programPrice.toString(),
          type: 'adult',
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
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

            <div className="grid grid-cols-2 gap-4">
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
                    <Input type="email" placeholder="john@example.com" {...field} />
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
                    <Input type="tel" placeholder="(555) 123-4567" {...field} />
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
                    <FormLabel>Select Session</FormLabel>
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

          {/* Additional Comments Section */}
          <div className="space-y-4 pt-6 border-t">
            <FormField
              control={form.control}
              name="additionalComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments (Optional)</FormLabel>
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

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
            >
              {isSubmitting ? 'Processing...' : `Continue to Payment - $${programPrice.toFixed(2)}`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

