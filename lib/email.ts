import "server-only";

import { resend, DEFAULT_FROM_EMAIL } from "./resend";

interface RegistrationItem {
  programName: string;
  registrationType: "adult" | "junior";
  formData: {
    // Adult fields
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    // Junior fields
    primaryContactFirstName?: string;
    primaryContactLastName?: string;
    primaryContactEmail?: string;
    primaryContactPhone?: string;
    childFirstName?: string;
    childLastName?: string;
    childAge?: number;
    childExperienceLevel?: string;
  };
  sessionInfo?: string;
  price: string;
}

interface EmailParams {
  to: string;
  items: RegistrationItem[];
  totalAmount: string;
  paymentId: string;
}

/**
 * Generate professional HTML email template for registration confirmation
 */
function generateConfirmationEmailHtml(params: EmailParams): string {
  const { to, items, totalAmount, paymentId } = params;

  const itemsHtml = items
    .map((item, index) => {
      const participantName =
        item.registrationType === "adult"
          ? `${item.formData.firstName} ${item.formData.lastName}`
          : `${item.formData.childFirstName} ${item.formData.childLastName}`;

      const contactInfo =
        item.registrationType === "adult"
          ? `<p style="margin: 4px 0; color: #666;">Email: ${item.formData.email}</p>
             <p style="margin: 4px 0; color: #666;">Phone: ${item.formData.phoneNumber}</p>`
          : `<p style="margin: 4px 0; color: #666;">Parent/Guardian: ${item.formData.primaryContactFirstName} ${item.formData.primaryContactLastName}</p>
             <p style="margin: 4px 0; color: #666;">Email: ${item.formData.primaryContactEmail}</p>
             <p style="margin: 4px 0; color: #666;">Phone: ${item.formData.primaryContactPhone}</p>
             <p style="margin: 4px 0; color: #666;">Child's Age: ${item.formData.childAge}</p>`;

      return `
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 18px;">
            ${item.programName}
            <span style="font-size: 14px; color: #666; font-weight: normal; margin-left: 8px;">
              (${item.registrationType === "junior" ? "Junior Program" : "Adult Program"})
            </span>
          </h3>
          <p style="margin: 4px 0; color: #374151; font-weight: 500;">Participant: ${participantName}</p>
          ${item.sessionInfo ? `<p style="margin: 4px 0; color: #666;">Session: ${item.sessionInfo}</p>` : ""}
          ${contactInfo}
          <p style="margin: 12px 0 0 0; color: #166534; font-weight: 600; font-size: 16px;">Price: $${item.price}</p>
        </div>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Confirmation - Toski Golf Academy</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 40px 40px 30px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Toski Golf Academy</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Registration Confirmation</p>
                </td>
              </tr>

              <!-- Success Badge -->
              <tr>
                <td style="padding: 30px 40px 20px 40px; text-align: center;">
                  <div style="display: inline-block; background-color: #dcfce7; border: 2px solid #22c55e; border-radius: 50px; padding: 12px 24px;">
                    <span style="color: #166534; font-weight: 600; font-size: 16px;">✓ Payment Successful</span>
                  </div>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                    Thank you for your registration! Your payment has been processed successfully. Below are the details of your registration(s).
                  </p>

                  <!-- Registration Items -->
                  <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                    Registration Details
                  </h2>
                  ${itemsHtml}

                  <!-- Total -->
                  <div style="background-color: #166534; border-radius: 8px; padding: 20px; margin-top: 24px; text-align: center;">
                    <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Total Amount Paid</p>
                    <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 28px; font-weight: 700;">$${totalAmount}</p>
                  </div>

                  <!-- Payment Reference -->
                  <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 13px;">
                    Payment Reference: ${paymentId}
                  </p>
                </td>
              </tr>

              <!-- What's Next Section -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
                    <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px;">What Happens Next?</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                      <li>You will receive additional details about your program schedule via email</li>
                      <li>Our team will reach out if any additional information is needed</li>
                      <li>Please arrive 10 minutes early for your first session</li>
                    </ul>
                  </div>
                </td>
              </tr>

              <!-- Contact Section -->
              <tr>
                <td style="padding: 0 40px 40px 40px;">
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
                    <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Questions? Contact Us</h3>
                    <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                      Email: <a href="mailto:info@toskigolfacademy.com" style="color: #166534; text-decoration: none;">info@toskigolfacademy.com</a>
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      Phone: <a href="tel:+15551234567" style="color: #166534; text-decoration: none;">(555) 123-4567</a>
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} Toski Golf Academy. All rights reserved.
                  </p>
                  <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px; text-align: center;">
                    This email was sent to ${to} regarding your registration.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Generate plain text version of the confirmation email
 */
function generateConfirmationEmailText(params: EmailParams): string {
  const { to, items, totalAmount, paymentId } = params;

  const itemsText = items
    .map((item, index) => {
      const participantName =
        item.registrationType === "adult"
          ? `${item.formData.firstName} ${item.formData.lastName}`
          : `${item.formData.childFirstName} ${item.formData.childLastName}`;

      const contactInfo =
        item.registrationType === "adult"
          ? `Email: ${item.formData.email}
Phone: ${item.formData.phoneNumber}`
          : `Parent/Guardian: ${item.formData.primaryContactFirstName} ${item.formData.primaryContactLastName}
Email: ${item.formData.primaryContactEmail}
Phone: ${item.formData.primaryContactPhone}
Child's Age: ${item.formData.childAge}`;

      return `
${index + 1}. ${item.programName} (${item.registrationType === "junior" ? "Junior Program" : "Adult Program"})
   Participant: ${participantName}
   ${item.sessionInfo ? `Session: ${item.sessionInfo}` : ""}
   ${contactInfo}
   Price: $${item.price}`;
    })
    .join("\n");

  return `
TOSKI GOLF ACADEMY
Registration Confirmation
========================

Thank you for your registration! Your payment has been processed successfully.

REGISTRATION DETAILS
--------------------
${itemsText}

TOTAL AMOUNT PAID: $${totalAmount}
Payment Reference: ${paymentId}

WHAT HAPPENS NEXT?
------------------
- You will receive additional details about your program schedule via email
- Our team will reach out if any additional information is needed
- Please arrive 10 minutes early for your first session

QUESTIONS? CONTACT US
---------------------
Email: info@toskigolfacademy.com
Phone: (555) 123-4567

© ${new Date().getFullYear()} Toski Golf Academy. All rights reserved.
This email was sent to ${to} regarding your registration.
`.trim();
}

/**
 * Send registration confirmation email to the customer
 */
export async function sendRegistrationConfirmationEmail(
  params: EmailParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { to, items, totalAmount, paymentId } = params;

    if (!process.env.EMAIL_API_KEY) {
      console.error("EMAIL_API_KEY is not configured");
      return { success: false, error: "Email service not configured" };
    }

    const html = generateConfirmationEmailHtml(params);
    const text = generateConfirmationEmailText(params);

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [to],
      subject: `Registration Confirmation - Toski Golf Academy`,
      html,
      text,
    });

    if (error) {
      console.error("Failed to send confirmation email:", error);
      return { success: false, error: error.message };
    }

    console.log(`Confirmation email sent successfully to ${to}. Email ID: ${data?.id}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
