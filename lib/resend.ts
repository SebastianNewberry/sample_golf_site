import "server-only";

import { Resend } from "resend";

// Initialize Resend client with API key from environment variable
export const resend = new Resend(process.env.EMAIL_API_KEY);

// Default sender email address for all outgoing emails
export const DEFAULT_FROM_EMAIL = "sebasn327@gmail.com";
