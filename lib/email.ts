import "server-only";

import { resend, DEFAULT_FROM_EMAIL } from "./resend";

interface SessionDate {
  date: string; // Formatted date string like "Monday, September 8, 2025"
  time: string; // Formatted time string like "6:00 PM"
}

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
  sessionDates?: SessionDate[]; // Structured session dates for better display
  price: string;
  startDate?: Date; // To help format the "Your class begins on..."
}

interface EmailParams {
  to: string;
  items: RegistrationItem[];
  totalAmount: string;
  paymentId: string;
}

const LOGO_URL = `${process.env.NEXT_PUBLIC_APP_URL}/logo.webp`;

/**
 * Returns the location name + city based on the season of the given date.
 * Summer (Apr-Oct): Sanctuary Lake Golf Course in Troy
 * Winter (Nov-Mar): Evolutionary Sportsplex
 */
function getLocationByDate(date?: Date): { name: string; full: string } {
  const isSummer = !date || (date.getMonth() >= 3 && date.getMonth() <= 9);
  if (isSummer) {
    return {
      name: "Sanctuary Lake Golf Course",
      full: "the Sanctuary Lake Golf Course in Troy",
    };
  } else {
    return {
      name: "Evolutionary Sportsplex",
      full: "the Evolutionary Sportsplex",
    };
  }
}

/**
 * Formats session dates as a clean HTML list for display in emails.
 * Single date: inline text. Multiple dates: bulleted list.
 */
function formatSessionDatesHtml(sessionDates?: SessionDate[]): string {
  if (!sessionDates || sessionDates.length === 0) return "";

  if (sessionDates.length === 1) {
    return `${sessionDates[0].date} at ${sessionDates[0].time}`;
  }

  // Multiple dates - render as a clean list
  const listItems = sessionDates
    .map(
      (sd) =>
        `<li style="margin: 4px 0; color: #374151;">${sd.date} at ${sd.time}</li>`,
    )
    .join("");

  return `<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;">${listItems}</ul>`;
}

function getProgramSpecificContent(
  programName: string,
  participantName: string,
  sessionInfo?: string,
  startDate?: Date,
  sessionDates?: SessionDate[],
) {
  // Normalize checking
  const name = programName.toLowerCase();
  const location = getLocationByDate(startDate);

  // Build the "Your class begins on..." line with inline date + location
  let classScheduleLine = "";
  if (sessionDates && sessionDates.length > 0) {
    classScheduleLine = `Your class begins on ${sessionDates[0].date} at ${sessionDates[0].time}, at ${location.full}.`;
  } else if (sessionInfo) {
    classScheduleLine = `Your class begins on ${sessionInfo}, at ${location.full}.`;
  } else {
    classScheduleLine = `Your class will be held at ${location.full}.`;
  }

  if (name.includes("golf for women")) {
    return `
      <div style="margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          ${participantName},
        </p>
        <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Thank you for choosing Toski Golf Academy's Golf for Women Program. Our professional staff is committed to the process of inspiring you to identify and reach your full potential in golf.
        </p>
        <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; line-height: 1.6; font-weight: 500;">
          ${classScheduleLine}
        </p>
      </div>
    `;
  }

  // Default content for other programs — include full details like weather, clubs, etc.
  return `
    <div style="margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
      <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; line-height: 1.6;">
        ${participantName},
      </p>
      <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; line-height: 1.6;">
        Thank you for choosing Toski Golf Academy. Our professional staff is committed to the process of inspiring you to identify and reach your full potential in golf.
      </p>
      <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; line-height: 1.6; font-weight: 500;">
        ${classScheduleLine}
      </p>
    </div>
  `;
}

/**
 * Generate professional HTML email template for registration confirmation
 */
function generateConfirmationEmailHtml(params: EmailParams): string {
  const { to, items, totalAmount, paymentId } = params;

  // Get the primary registrant's first name for the greeting
  if (!items || items.length === 0) {
    console.error("[Email] No items provided for email generation");
    return "";
  }

  const firstItem = items[0];
  if (!firstItem.formData) {
    console.warn("[Email] Missing formData for first item");
  }

  const primaryFirstName =
    firstItem.registrationType === "adult"
      ? (firstItem.formData as any)?.firstName
      : (firstItem.formData as any)?.primaryContactFirstName;
  const greetingName = primaryFirstName || "there";

  // Build program detail sections (without pricing — pricing goes in receipt at bottom)
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

      // Build session display — use sessionDates for a nicer list if available
      let sessionHtml = "";
      if (item.sessionDates && item.sessionDates.length > 0) {
        const formattedDates = formatSessionDatesHtml(item.sessionDates);
        sessionHtml = `
          <div style="margin: 8px 0;">
            <p style="margin: 0 0 4px 0; color: #374151; font-weight: 500;">Scheduled Sessions:</p>
            ${formattedDates}
          </div>
        `;
      } else if (item.sessionInfo) {
        sessionHtml = `<p style="margin: 4px 0; color: #666;">Session: ${item.sessionInfo}</p>`;
      }

      // Location line
      const location = getLocationByDate(item.startDate);
      const locationHtml = `<p style="margin: 4px 0; color: #666;">📍 Location: <strong>${location.name}</strong></p>`;

      const specificContent = getProgramSpecificContent(
        item.programName,
        participantName,
        item.sessionInfo,
        item.startDate,
        item.sessionDates,
      );

      return `
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 18px;">
            ${item.programName}
            <span style="font-size: 14px; color: #666; font-weight: normal; margin-left: 8px;">
              (${item.registrationType === "junior" ? "Junior Program" : "Adult Program"})
            </span>
          </h3>
          <p style="margin: 4px 0; color: #374151; font-weight: 500;">Participant: ${participantName}</p>
          ${sessionHtml}
          ${locationHtml}
          ${contactInfo}
          ${specificContent}
        </div>
      `;
    })
    .join("");

  // Build receipt-style pricing breakdown at the bottom
  const receiptItemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 6px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #f3f4f6;">
          ${item.programName}
          <span style="color: #9ca3af; font-size: 12px; margin-left: 4px;">(${item.registrationType === "junior" ? "Junior" : "Adult"})</span>
        </td>
        <td style="padding: 6px 0; color: #6b7280; font-size: 13px; text-align: right; border-bottom: 1px solid #f3f4f6;">
          $${item.price}
        </td>
      </tr>
    `,
    )
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
                  <img src="${LOGO_URL}" alt="Toski Golf Academy" style="width: 120px; height: auto; margin-bottom: 16px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.2);" />
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Toski Golf Academy</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Registration Confirmation</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 30px 40px 30px 40px;">
                  <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                    Hi ${greetingName},
                  </p>
                  <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                    Thank you for your registration with Toski Golf Academy! Please review the important academy policies below, followed by the specific details of your registration(s).
                  </p>

                  <!-- Important Academy Information (Moved from individual items) -->
                  <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #bbf7d0;">
                    <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 18px;">Important Student Information</h3>
                    <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                      <strong>Where to meet:</strong> We will meet on the practice tee, which is located behind the clubhouse. Look for the black and white Titleist tent.
                    </p>
                    <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                      <strong>Equipment:</strong> If you have clubs bring them with you. If not, clubs are provided for you at no cost and we prefer that you don't buy clubs until after you start your class. When you're ready we will recommend the appropriate clubs to help you lower your scores and increase your enjoyment of the game.
                    </p>
                    <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                      <strong>Weather Policy:</strong> Golf classes will be held outside, so check the weather forecast on the day of your class and dress accordingly. In the event of inclement weather, the class will be postponed and rescheduled for a later date. An Academy staff member will notify you by email or text when a class is cancelled.
                    </p>
                    <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                      <strong>Attendance:</strong> If you have to miss a class, we will do our best to accommodate a make-up session on another day. Just contact a member of the Academy staff and we will do our best to fulfill your request. We encourage you to contact the Academy directly with any questions about your program or any other programs we offer. 
                    </p>
                    <p style="margin: 0 0 0 0; color: #374151; font-size: 15px; line-height: 1.6; font-weight: 500;">
                      Again, thank you for selecting our Academy and we look forward to seeing you on the golf course this season.
                    </p>
                  </div>

                  <!-- Registration Items -->
                  <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                    Registration Details
                  </h2>
                  ${itemsHtml}
                </td>
              </tr>

              <!-- Signature -->
              <tr>
                <td style="padding: 0 40px 24px 40px;">
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    <p style="margin: 0 0 2px 0; color: #374151; font-size: 14px; font-weight: 600;">Paul Toski, PGA</p>
                    <p style="margin: 0 0 2px 0; color: #6b7280; font-size: 13px;">Member</p>
                    <p style="margin: 0 0 2px 0; color: #6b7280; font-size: 13px;">Toski Golf Academy</p>
                    <p style="margin: 0; color: #6b7280; font-size: 13px;">
                      <a href="tel:+12485633561" style="color: #166534; text-decoration: none;">(248) 563-3561</a>
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Contact Section -->
              <tr>
                <td style="padding: 0 40px 20px 40px;">
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
                    <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Questions? Contact Us</h3>
                    <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                      Email: <a href="mailto:info@toskigolfacademy.com" style="color: #166534; text-decoration: none;">info@toskigolfacademy.com</a>
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      Phone: <a href="tel:+12485633561" style="color: #166534; text-decoration: none;">(248) 563-3561</a>
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Receipt-style pricing summary at the bottom -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Summary</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${receiptItemsHtml}
                      <tr>
                        <td style="padding: 8px 0 0 0; color: #374151; font-size: 13px; font-weight: 600; border-top: 1px solid #e5e7eb;">
                          Total
                        </td>
                        <td style="padding: 8px 0 0 0; color: #374151; font-size: 13px; font-weight: 600; text-align: right; border-top: 1px solid #e5e7eb;">
                          $${totalAmount}
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                    &copy; ${new Date().getFullYear()} Toski Golf Academy. All rights reserved.
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
  const { to, items, totalAmount } = params;

  const firstItem = items[0];
  const primaryFirstName =
    firstItem?.registrationType === "adult"
      ? firstItem.formData?.firstName
      : firstItem.formData?.primaryContactFirstName;
  const greetingName = primaryFirstName || "there";

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

      const location = getLocationByDate(item.startDate);

      let classInfo = "";
      if (item.sessionDates && item.sessionDates.length > 0) {
        classInfo = `Your class begins on ${item.sessionDates[0].date} at ${item.sessionDates[0].time}, at ${location.full}.`;
      } else if (item.sessionInfo) {
        classInfo = `Your class begins on ${item.sessionInfo}, at ${location.full}.`;
      } else {
        classInfo = `Your class will be held at ${location.full}.`;
      }

      return `
${index + 1}. ${item.programName} (${item.registrationType === "junior" ? "Junior Program" : "Adult Program"})
   Participant: ${participantName}
   ${item.sessionInfo ? `Session: ${item.sessionInfo}` : ""}
   Location: ${location.name}
   ${contactInfo}

   ${classInfo}

   We will meet on the practice tee, which is located behind the clubhouse. Look for the black and white Titleist tent. If you have clubs bring them with you. If not, clubs are provided for you at no cost and we prefer that you don't buy clubs until after you start your class. When you're ready we will recommend the appropriate clubs to help you lower your scores and increase your enjoyment of the game.

   Golf classes will be held outside, so check the weather forecast on the day of your class and dress accordingly. In the event of inclement weather, the class will be postponed and rescheduled for a later date. An Academy staff member will notify you by email or text when a class is cancelled. If you have to miss a class, we will do our best to accommodate a make-up session on another day. Just contact a member of the Academy staff and we will do our best to fulfill your request.

   We encourage you to contact the Academy directly with any questions about your program or any other programs we offer.`;
    })
    .join("\n");

  const receiptText = items
    .map(
      (item) =>
        `  ${item.programName} (${item.registrationType === "junior" ? "Junior" : "Adult"}) — $${item.price}`,
    )
    .join("\n");

  return `
TOSKI GOLF ACADEMY
Registration Confirmation
========================

Hi ${greetingName},

Thank you for your registration with Toski Golf Academy!

REGISTRATION DETAILS
--------------------
${itemsText}

Again, thank you for selecting our Academy and we look forward to seeing you on the golf course this season.

Paul Toski, PGA
Member
Toski Golf Academy
(248) 563-3561

QUESTIONS? CONTACT US
---------------------
Email: info@toskigolfacademy.com
Phone: (248) 563-3561

ORDER SUMMARY
-------------
${receiptText}
  Total: $${totalAmount}

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

    console.log(
      `Confirmation email sent successfully to ${to}. Email ID: ${data?.id}`,
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
