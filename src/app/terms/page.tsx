import type { Metadata } from "next";
import { company } from "@/data/company";
import { displayContact } from "@/lib/display";
import { loadSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for the ADALIA OIL AND GAS LTD website: website information, enquiries, communications, intellectual property, liability disclaimer and contact details.",
  keywords: ["ADALIA OIL AND GAS LTD", "terms of use", "terms and conditions"]
};

export default function TermsPage() {
  const settings = loadSettings();
  const contact = displayContact();
  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Terms of Use</h1>
      </div>
      <section className="section-padding bg-white">
        <div className="prose prose-slate mx-auto max-w-4xl px-4 md:px-6">
          <p>
            Welcome to the {company.name} website ("Site"). By accessing this Site, you agree to use it lawfully, respectfully and in compliance with these Terms of Use.
          </p>

          <h2>Website Information</h2>
          <p>
            Content on this Site is provided for general information about {company.name} and its services. Service descriptions, divisions, certifications, projects and company information are presented when verified by management; the website does not guarantee the accuracy or completeness of forward-looking statements.
          </p>

          <h2>Enquiries and Communications</h2>
          <p>
            Submitting an enquiry through our website does not create a binding contract. Any business relationship, quotation, partnership or supply agreement is established through appropriate direct communication and agreed terms. The company reserves the right to review enquiries before responding.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All website content, branding, images and materials are the property of {company.name} or are used with permission, unless otherwise stated. Use of materials from the Site is prohibited except as permitted by these Terms.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            The Site and its content are provided "as is" without warranties of any kind, express or implied. {company.name} disclaims liability for direct, indirect, incidental or consequential damages arising from use of the Site or its content.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We may review and update these Terms at any time. The updated version will be posted on this Site and applies prospectively.
          </p>

          <h2>Contact</h2>
          <p>For questions regarding these Terms, please contact us:</p>
          <ul>
            {contact.email.value && <li>Email: {contact.email.value}</li>}
            {contact.phone.value && <li>Phone: {contact.phone.value}</li>}
            <li>Address: {contact.address.value || "(registered office address to be verified)"}</li>
            {settings.company.rcNumber && <li>RC: {settings.company.rcNumber}</li>}
          </ul>

          <p className="text-sm text-slate-500">This Terms of Use document is reviewed periodically and updated in accordance with applicable laws and regulations. Flag: legal review required before publication.</p>
        </div>
      </section>
    </div>
  );
}
