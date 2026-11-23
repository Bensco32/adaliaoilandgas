/**
 * Enhanced Privacy Policy (Nigeria Data Protection Act 2023 context).
 * - Covers information collected, purpose of collection, storage and
 *   retention, third-party processors, data security, user rights, and
 *   contact for privacy enquiries.
 * - Notes that the app has no analytics/tracking cookies (see CookiePolicy).
 * - Flag: legal review before publication.
 */
import type { Metadata } from "next";
import { company } from "@/data/company";
import { displayContact } from "@/lib/display";
import { loadSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for the ADALIA OIL AND GAS LTD website. Information collected, storage and retention, third-party processors, security and your privacy rights under the Nigeria Data Protection Act 2023.",
  keywords: ["ADALIA OIL AND GAS LTD", "privacy policy", "data protection", "Nigeria"]
};

const privacyItems = [
  "We collect your name, email address, phone number, company name, country, division of interest and message details when you submit a contact or enquiry form, or use the supplier registration form. We also store uploaded documents where you submit them.",
  "The purposes of collecting this information are: responding to your enquiries promptly, providing quotations and updates relevant to your interest, verifying registrations where relevant, and managing our business.",
  "We retain contact records for 90 days. Supplier registration and enquiry records are stored in a structured format. Personal data is not processed for automated decisions with legal or similarly significant effects.",
  "Administrative data (for example, device data, browser type and approximate location) is limited to what is needed for security and usability, and is not sold to third parties.",
  "We use the following technical protections: HTTPS encryption in production, secure password hashing, session cookies that are HttpOnly, SameSite=Strict and Secure, rate limiting on submissions, CSRF/origin checks, and anti-spam honeypots. We do not use third-party analytics or tracking cookies — see the Cookie Policy.",
  "We do not share your personal information with any third party, except where required by law, and we do not sell personal data.",
  "You have the right to: access your personal data, request correction or deletion of it, withdraw consent where applicable, and object to or restrict processing. Requests may be made to the contact address below.",
  "You may also unsubscribe from newsletters by replying to the email you receive, if any."
];

export default function PrivacyPage() {
  const settings = loadSettings();
  const contact = displayContact();
  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-3 text-gold-300">How ADALIA OIL AND GAS LTD handles your personal information</p>
      </div>
      <section className="section-padding bg-white">
        <div className="prose prose-slate mx-auto max-w-4xl px-4 md:px-6">
          <p>
            {settings.company.name} respects your privacy and this Policy describes how we collect, store, use and protect personal information collected through our website (the &quot;Site&quot;) and related services. This Policy is written for general use and may be reviewed and updated by the company.
          </p>
          <h2>Information We Collect</h2>
          <ul>
            {privacyItems.slice(0, 1)}
          </ul>
          <h2>Purpose of Collection</h2>
          <p>{privacyItems[1]}</p>
          <h2>Data Storage and Retention</h2>
          <p>{privacyItems[2]}</p>
          <h2>Third-Party Processors</h2>
          <p>{privacyItems[4]}</p>
          <h2>Data Security</h2>
          <p>We take reasonable technical and organizational measures to protect your information. Uploaded documents are stored in a controlled directory and are served back to you only. We do not store card numbers or passwords in plain text — passwords are hashed with scrypt.</p>
          <h2>Your Rights</h2>
          <p>{privacyItems[5]}</p>
          <p>{privacyItems[6]}</p>
          <h2>Contact for Privacy Enquiries</h2>
          <p>
            For privacy-related questions, requests for access, deletion or correction of your personal data, please contact:
          </p>
          <ul>
            {contact.email.value && <li>Email: {contact.email.value}</li>}
            {contact.phone.value && <li>Phone: {contact.phone.value}</li>}
            <li>
              Address: {settings.company.rcNumber ? `RC ${settings.company.rcNumber}, ` : ""}
              {contact.address.value || "(registered office address to be verified)"}
            </li>
          </ul>
          <p className="text-sm text-slate-500">{privacyItems[7]}</p>
        </div>
      </section>
    </div>
  );
}
