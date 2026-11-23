import nodemailer from "nodemailer";
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "./contact-config";

export type DeliveryState = "sent" | "not_configured" | "activation_required" | "failed";

export interface DeliveryResult {
  email: DeliveryState;
  whatsapp: DeliveryState;
  whatsappUrl: string;
  details: { email?: string; whatsapp?: string };
}

/** Sends the enquiry by email using SMTP. Credentials stay on the server. */
async function sendEmailViaFormSubmit(
  subject: string,
  data: { fullName: string; email: string; companyName?: string; phone?: string; country?: string; division: string; message: string }
): Promise<{ state: DeliveryState; detail?: string }> {
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Referer: process.env.NEXT_PUBLIC_SITE_URL || "https://adaliaoilandgasltd.com"
      },
      body: JSON.stringify({
        _subject: `Website enquiry: ${subject}`,
        name: data.fullName,
        email: data.email,
        company: data.companyName || "",
        phone: data.phone || "",
        country: data.country || "",
        division: data.division,
        subject,
        message: data.message
      }),
      signal: AbortSignal.timeout(20000)
    });

    const payload = (await response.json().catch(() => ({}))) as { success?: unknown; message?: unknown };
    if (String(payload.success) === "true") return { state: "sent" };

    const detail = String(payload.message || `Email relay returned HTTP ${response.status}`).slice(0, 200);
    if (/activat/i.test(detail)) return { state: "activation_required", detail };
    return { state: "failed", detail };
  } catch (error) {
    return { state: "failed", detail: error instanceof Error ? error.message.slice(0, 200) : String(error) };
  }
}

async function sendEmail(
  subject: string,
  body: string,
  replyTo: string,
  data: { fullName: string; email: string; companyName?: string; phone?: string; country?: string; division: string; message: string }
): Promise<{ state: DeliveryState; detail?: string }> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    // No SMTP credentials: use the credential-free relay to the same address.
    return sendEmailViaFormSubmit(subject, data);
  }

  try {
    const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM?.trim() || user,
      to: CONTACT_EMAIL,
      replyTo,
      subject: `Website enquiry: ${subject}`,
      text: body
    });
    transporter.close();
    return { state: "sent" };
  } catch (error) {
    return { state: "failed", detail: error instanceof Error ? error.message.slice(0, 200) : String(error) };
  }
}

/** Sends the enquiry to WhatsApp via the Cloud API when it is configured. */
async function sendWhatsapp(body: string): Promise<{ state: DeliveryState; detail?: string }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!token || !phoneId) {
    return { state: "not_configured", detail: "WhatsApp Cloud API credentials are not set" };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(phoneId)}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: WHATSAPP_NUMBER,
          type: "text",
          text: { preview_url: false, body: body.slice(0, 4000) }
        }),
        signal: AbortSignal.timeout(15000)
      }
    );
    if (!response.ok) {
      return { state: "failed", detail: `WhatsApp API returned ${response.status}` };
    }
    return { state: "sent" };
  } catch (error) {
    return { state: "failed", detail: error instanceof Error ? error.message.slice(0, 200) : String(error) };
  }
}

export async function deliverEnquiry(input: {
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
  country?: string;
  division: string;
  subject: string;
  message: string;
  whatsappUrl: string;
  body: string;
}): Promise<DeliveryResult> {
  const [mail, chat] = await Promise.all([
    sendEmail(input.subject, input.body, input.email, input),
    sendWhatsapp(input.body)
  ]);

  if (mail.state === "activation_required") {
    console.warn(
      `[Contact] Email relay needs one-time activation. Check ${CONTACT_EMAIL} (including spam) for the "Activate Form" email from FormSubmit and click the link. Queued enquiries are delivered after activation.`
    );
  }

  return {
    email: mail.state,
    whatsapp: chat.state,
    whatsappUrl: input.whatsappUrl,
    details: {
      ...(mail.detail ? { email: mail.detail } : {}),
      ...(chat.detail ? { whatsapp: chat.detail } : {})
    }
  };
}
