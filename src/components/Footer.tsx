import Link from "next/link";
import { company } from "@/data/company";
import { displayContact } from "@/lib/display";
import { getHsePolicies, getGovernanceDocs } from "@/lib/settings";

export function Footer() {
  const contact = displayContact();
  const hsePolicies = getHsePolicies().filter((p) => p.verified && p.status === "published");
  const governanceDocs = getGovernanceDocs().filter((d) => d.verified && d.status === "published");

  return (
    <footer className="bg-navy-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:px-6 md:grid-cols-3 lg:grid-cols-5">
        <div>
          <h3 className="text-lg font-semibold text-gold-400">COMPANY</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link href="/about" className="hover:text-gold-400">About Us</Link></li>
            <li><Link href="/about#vision" className="hover:text-gold-400">Our Vision</Link></li>
            <li><Link href="/about#mission" className="hover:text-gold-400">Our Mission</Link></li>
            <li><Link href="/about#values" className="hover:text-gold-400">Our Core Values</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gold-400">OUR DIVISIONS</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link href="/divisions/drilling-services" className="hover:text-gold-400">Drilling Services</Link></li>
            <li><Link href="/divisions/crude-lifting-marine-logistics" className="hover:text-gold-400">Crude Lifting &amp; Marine Logistics</Link></li>
            <li><Link href="/divisions/gas" className="hover:text-gold-400">Adalia Gas</Link></li>
            <li><Link href="/divisions/petroleum-supply" className="hover:text-gold-400">Petroleum Supply</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gold-400">GOVERNANCE &amp; COMPLIANCE</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link href="/compliance" className="hover:text-gold-400">Compliance &amp; Certifications</Link></li>
            <li><Link href="/governance" className="hover:text-gold-400">Corporate Governance</Link></li>
            <li><Link href="/hse" className="hover:text-gold-400">HSE Policies</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gold-400">QUICK LINKS</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link href="/" className="hover:text-gold-400">Home</Link></li>
            <li><Link href="/services" className="hover:text-gold-400">Services</Link></li>
            <li><Link href="/projects" className="hover:text-gold-400">Projects</Link></li>
            <li><Link href="/suppliers" className="hover:text-gold-400">Suppliers</Link></li>
            <li><Link href="/contact" className="hover:text-gold-400">Contact Us</Link></li>
            <li><Link href="/faq" className="hover:text-gold-400">FAQs</Link></li>
            <li><Link href="/privacy" className="hover:text-gold-400">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-gold-400">Terms</Link></li>
            <li><Link href="/cookie-policy" className="hover:text-gold-400">Cookie Policy</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gold-400">CONTACT</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {contact.phone.value && <li>Phone: <a href={`tel:${contact.phone.value}`} className="hover:text-gold-400">{contact.phone.value}</a></li>}
            {contact.email.value && <li>Email: <a href={`mailto:${contact.email.value}`} className="hover:text-gold-400">{contact.email.value}</a></li>}
            {contact.address.value && <li>Address: {contact.address.value}</li>}
            {company.rcNumber && <li>RC: {company.rcNumber}</li>}
            {(contact.phone.pending || contact.email.pending || contact.address.pending) && (
              <li className="text-xs">Details marked &quot;to be verified&quot; are pending company confirmation.</li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-sm text-white/70 md:flex-row md:px-6">
          <p>© 2026 {company.name}. All Rights Reserved.</p>
          <p className="font-medium text-gold-400">{company.slogan}</p>
        </div>
      </div>
      {hsePolicies.length > 0 && (
        <div className="mt-4 px-4 pb-6 text-sm text-white/60">
          <p className="mb-2 font-medium">Published HSE policies: {hsePolicies.length}</p>
          <p>{hsePolicies.map((p) => p.title).join(", ")}</p>
          <p className="mt-2">Published governance documents: {governanceDocs.length}</p>
        </div>
      )}
    </footer>
  );
}
