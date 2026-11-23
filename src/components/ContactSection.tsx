import { company } from "@/data/company";
import { displayContact } from "@/lib/display";
import { ContactForm, SocialLinks } from "@/components/ContactForm";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

function Detail({ icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null; href?: string }) {
  const Icon = icon;
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 h-5 w-5 text-gold-400" />
      <div>
        <div className="font-medium">{label}</div>
        {value && (href ? <a href={href} className="text-gold-300 hover:underline">{value}</a> : <span>{value}</span>)}
      </div>
    </li>
  );
}

export function ContactSection() {
  const contact = displayContact();
  const pendingNotes: string[] = [];
  if (contact.address.pending) pendingNotes.push("Registered office address");
  if (contact.phone.pending) pendingNotes.push("Official telephone number");
  if (contact.email.pending) pendingNotes.push("Official contact email");
  if (contact.rcNumber.pending) pendingNotes.push("CAC registration number");

  return (
    <section id="contact" className="section-padding bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center" id="consultation">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">Get in Touch</p>
          <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">LET&apos;S POWER THE FUTURE TOGETHER.</h2>
          <p className="mt-4 text-slate-600">Whether you are seeking energy solutions, strategic partnerships, procurement support or business enquiries, our team is ready to hear from you.</p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl bg-navy-900 p-6 text-white">
              <h3 className="text-xl font-semibold">Contact Details</h3>
              <ul className="mt-5 space-y-4 text-sm">
                <Detail icon={Globe} label="Company" value={company.name} />
                <Detail icon={Globe} label="Website" value={company.website} href={company.website} />
                {contact.address.value && <Detail icon={MapPin} label="Address" value={contact.address.value} />}
                {contact.phone.value && <Detail icon={Phone} label="Phone" value={contact.phone.value} href={`tel:${contact.phone.value}`} />}
                {contact.email.value && <Detail icon={Mail} label="Email" value={contact.email.value} href={`mailto:${contact.email.value}`} />}
              </ul>
              {pendingNotes.length > 0 && (
                <div className="mt-5 space-y-2">
                  {pendingNotes.map((n) => (
                    <p key={n} className="text-sm text-gold-400">{n} to be verified by management.</p>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-xl bg-navy-900 p-6 text-white">
              <h3 className="text-xl font-semibold">Follow Us</h3>
              <p className="mt-2 text-sm text-white/70">Connect with ADALIA OIL AND GAS LTD on social media.</p>
              <SocialLinks />
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
