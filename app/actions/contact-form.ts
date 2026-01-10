"use server";

import { z } from "zod";
import { insertContactSubmission } from "@/db/queries/contact-submissions";
import type { NewContactSubmission } from "@/db/schema";

// Zod schema for contact form validation
const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Server action to handle contact form submission
 */
export async function submitContactForm(formData: ContactFormData) {
  try {
    // Validate form data using Zod
    const validatedData = contactFormSchema.parse(formData);

    // Prepare data for database insertion
    const submissionData: NewContactSubmission = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phoneNumber: validatedData.phoneNumber,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
    };

    // Insert into database
    const result = await insertContactSubmission(submissionData);

    return {
      success: true,
      submissionId: result.id,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors
      return {
        success: false,
        error: "Validation failed"
      };
    }

    console.error("Error submitting contact form:", error);
    return {
      success: false,
      error: "Failed to submit contact form. Please try again.",
    };
  }
}

