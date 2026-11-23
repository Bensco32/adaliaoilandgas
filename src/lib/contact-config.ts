/** Server-only notification destinations. Values can be overridden by environment variables. */

export const CONTACT_EMAIL =
  process.env.CONTACT_TO_EMAIL?.trim() || "benscottlove816@gmail.com";

const rawWhatsapp = (process.env.WHATSAPP_NUMBER || "08133744562").replace(/\D/g, "");
export const WHATSAPP_NUMBER = rawWhatsapp.startsWith("0")
  ? `234${rawWhatsapp.slice(1)}`
  : rawWhatsapp;

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function enquiryMessage(data: {
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
  country?: string;
  division: string;
  subject: string;
  message: string;
}): string {
  return [
    "New enquiry via the Adalia Oil and Gas Ltd website",
    "",
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    data.companyName ? `Company: ${data.companyName}` : "",
    data.phone ? `Phone: ${data.phone}` : "",
    data.country ? `Country: ${data.country}` : "",
    `Division of interest: ${data.division}`,
    `Subject: ${data.subject}`,
    "",
    data.message
  ]
    .filter(Boolean)
    .join("\n");
}
