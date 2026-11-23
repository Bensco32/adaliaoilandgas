"use client";

import { useState } from "react";
import { company } from "@/data/company";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

export interface ContactDetails {
  address: { value: string | null; pending: boolean };
  phone: { value: string | null; pending: boolean };
  email: { value: string | null; pending: boolean };
}

function SocialIcon({ name }: { name: "whatsapp" | "instagram" | "facebook" }) {  if (name === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-gold-400" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    );
  }
  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-gold-400" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-gold-400" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
    </svg>
  );
}

const socials = [
  { key: "whatsapp" as const, label: "WhatsApp", href: company.social.whatsapp },
  { key: "instagram" as const, label: "Instagram", href: company.social.instagram },
  { key: "facebook" as const, label: "Facebook", href: company.social.facebook }
];

const divisionOptions = [
  "Adalia Drilling Services",
  "Adalia Crude Lifting, Marine & Logistics",
  "Adalia Gas",
  "Adalia Petroleum Supply",
  "General Business Enquiry",
  "Strategic Partnership",
  "Other"
];

interface FormState {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  division: string;
  subject: string;
  message: string;
  website: string;
}

const EMPTY_FORM: FormState = {
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  country: "",
  division: "",
  subject: "",
  message: "",
  website: ""
};

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [message, setMessage] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim()) next.email = "Email address is required.";
    else if (!validEmail(form.email)) next.email = "Please provide a valid email address.";
    if (!form.division) next.division = "Please select a division of interest.";
    if (!form.subject.trim()) next.subject = "Subject is required.";
    if (!form.message.trim()) next.message = "Please describe your enquiry.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    setMessage("");
    try {
      const payload = {
        fullName: form.fullName.trim(),
        companyName: form.companyName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        division: form.division,
        subject: form.subject.trim(),
        message: form.message.trim(),
        website: form.website
      };
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Submission failed");
      const delivery = json.delivery;
      setWhatsappLink(delivery?.whatsappUrl || "");
      setStatus("success");
      if (delivery?.email === "activation_required") {
        setMessage("Thank you. Your enquiry has been recorded and queued for delivery to our team.");
      } else if (delivery?.email === "sent" && delivery?.whatsapp === "sent") {
        setMessage("Thank you. Your enquiry has been sent to our team by email and WhatsApp.");
      } else if (delivery?.email === "sent" || delivery?.whatsapp === "sent") {
        setMessage("Thank you. Your enquiry has been sent to our team. We'll respond as soon as possible.");
      } else if (json.recorded) {
        setMessage("Thank you. Your enquiry has been recorded and stored. We'll respond as soon as possible.");
      } else {
        setMessage("Thank you. Your enquiry has been received. Our team will get in touch shortly.");
      }
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again or contact us directly.");
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="adalia-fullName">Full Name *</label>
          <input id="adalia-fullName" name="fullName" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className={inputClass} aria-invalid={!!errors.fullName} />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="adalia-companyName">Company Name</label>
          <input id="adalia-companyName" name="companyName" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="adalia-email">Email Address *</label>
          <input id="adalia-email" name="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} aria-invalid={!!errors.email} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="adalia-phone">Phone Number</label>
          <input id="adalia-phone" name="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="adalia-country">Country</label>
          <input id="adalia-country" name="country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="adalia-division">Division of Interest *</label>
          <select id="adalia-division" name="division" value={form.division} onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))} className={inputClass} aria-invalid={!!errors.division}>
            <option value="">Select a division</option>
            {divisionOptions.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          {errors.division && <p className="mt-1 text-xs text-red-600">{errors.division}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="adalia-subject">Subject *</label>
        <input id="adalia-subject" name="subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className={inputClass} aria-invalid={!!errors.subject} />
        {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="adalia-message">Message *</label>
        <textarea id="adalia-message" name="message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={5} className={inputClass} aria-invalid={!!errors.message} />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>
      <div className="hidden" aria-hidden="true">
        <label className="text-xs text-slate-400">
          Bot protection — leave this field blank
          <input name="website" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} tabIndex={-1} autoComplete="off" className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-red-500" />
        </label>
      </div>
      <button type="submit" disabled={status === "loading"} className="rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">
        {status === "loading" ? "Sending..." : "Submit Enquiry"}
      </button>
      {message && <p className={`text-sm ${status === "success" ? "text-green-700" : "text-red-700"}`}>{message}</p>}
      {status === "error" && (
        <p className="text-sm text-red-700">
          Sorry, we could not deliver your enquiry right now. Please try again in a few minutes or contact us by phone or WhatsApp.
        </p>
      )}
      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block rounded-md border border-gold-500 px-4 py-2 text-sm font-semibold text-gold-700 hover:bg-gold-50"
        >
          Continue on WhatsApp
        </a>
      )}
    </form>
  );
}

export function SocialLinks() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {socials.map((social) => (
        <a
          key={social.key}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-4 text-center transition hover:border-gold-500/40 hover:bg-white/10"
        >
          <SocialIcon name={social.key} />
          <span className="text-xs font-medium">{social.label}</span>
        </a>
      ))}
    </div>
  );
}
