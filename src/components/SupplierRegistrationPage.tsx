"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isRateLimited } from "@/lib/rateLimiter";
import { isDocumentAllowed, sanitizeFileName } from "@/lib/fileTypes";

type Registration = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  servicesDescription: string;
  cacRegistration: string;
  documents: Array<{ name: string; path: string }>;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const AGREEMENT_ACK = "You agree that submitting this registration does not guarantee supplier approval or future contract awards.";

export function SupplierRegistrationPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [files, setFiles] = useState<Array<{ name: string; size: number }>>([]);
  const [rateLimited, setRateLimited] = useState(false);
  const [form, setForm] = useState<Registration & { csrf: string; ack: boolean }>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    servicesDescription: "",
    cacRegistration: "",
    documents: [],
    csrf: "",
    ack: false
  });

  function set(key: keyof Registration, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function trim(value: string, max: number): string {
    return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
  }

  async function uploadFiles(fileList: FileList) {
    const selected = [...fileList].slice(0, 10);
    const nextFiles: Array<{ name: string; size: number }> = [];
    for (const file of selected) {
      const check = isDocumentAllowed(file.name, file.size);
      if (!check.ok) {
        setMsg(check.reason);
        continue;
      }
      nextFiles.push({ name: sanitizeFileName(file.name), size: file.size });
    }
    setFiles(nextFiles);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const rate = isRateLimited(`supplier-form:${window.location.hostname}`, 3, 15 * 60_000);
    if (!rate.allowed) {
      setRateLimited(true);
      setMsg("Too many submission attempts. Please try again later.");
      return;
    }
    if (!accepted) {
      setMsg("Please confirm that you accept the terms of the supplier registration.");
      return;
    }
    if (!validateEmail(form.email)) {
      setMsg("Please provide a valid email address.");
      return;
    }
    setBusy(true);
    setMsg("");

    try {
      const formData = new FormData();
      formData.append("companyName", trim(form.companyName, 200));
      formData.append("contactPerson", trim(form.contactPerson, 200));
      formData.append("email", trim(form.email, 200));
      formData.append("phone", trim(form.phone, 100));
      formData.append("address", trim(form.address, 400));
      formData.append("servicesDescription", trim(form.servicesDescription, 3000));
      formData.append("cacRegistration", trim(form.cacRegistration, 200));
      const formFileInputs = (e.currentTarget.querySelectorAll<HTMLInputElement>("input[type=file]"));
      const chosen: File[] = [];
      formFileInputs.forEach((input) => {
        if (input.files) chosen.push(...Array.from(input.files));
      });
      for (const file of chosen) {
        if (isDocumentAllowed(file.name, file.size).ok) formData.append("documents", file, sanitizeFileName(file.name));
      }

      const res = await fetch("/api/suppliers", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || "We could not submit your application. Please try again.");
        return;
      }
      setMsg("Thank you for applying to become an Adalia Oil and Gas Ltd supplier. Your application is under review and you will be contacted via the email you provided.");
      setTimeout(() => router.push("/contact"), 3000);
    } catch {
      setMsg("We could not submit your application. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Supplier Registration</h1>
        <p className="mt-2 text-sm text-slate-600">
          Apply to become a supplier or contractor for ADALIA OIL AND GAS LTD. {AGREEMENT_ACK}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name *">
          <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} required maxLength={200} className={inputClass} autoComplete="organization" />
        </Field>
        <Field label="Contact person name *">
          <input value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} required maxLength={200} className={inputClass} autoComplete="name" />
        </Field>
        <Field label="Email address *">
          <input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" required maxLength={200} className={inputClass} autoComplete="email" />
        </Field>
        <Field label="Phone number *">
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} required maxLength={100} className={inputClass} autoComplete="tel" />
        </Field>
      </div>

      <div>
        <Field label="Business address">
          <input value={form.address} onChange={(e) => set("address", e.target.value)} required className={inputClass} autoComplete="street-address" />
        </Field>
      </div>

      <div>
        <Field label="Type of services or products supplied *">
          <textarea value={form.servicesDescription} onChange={(e) => set("servicesDescription", e.target.value)} required rows={4} maxLength={3000} className={inputClass} />
          <p className="mt-1 text-xs text-slate-500">e.g. rig pumps, drill string, valves, LPG cylinders, truck fuel delivery, logistical services.</p>
        </Field>
      </div>

      <div>
        <Field label="CAC registration number (where applicable)">
          <input value={form.cacRegistration} onChange={(e) => set("cacRegistration", e.target.value)} className={inputClass} autoComplete="off" />
        </Field>
      </div>

      <div>
        <Field label="Supporting documents (optional, PDF or image, ≤ 2 MB each)">
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/gif,image/webp"
            multiple
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-sm"
          />
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {files.map((f) => (
                <li key={f.name}>{f.name} ({f.size} bytes)</li>
              ))}
            </ul>
          )}
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required />
          {AGREEMENT_ACK}
        </label>
      </div>

      <div className="hidden" aria-hidden="true">
        <input name="website_alt" defaultValue="" tabIndex={-1} autoComplete="off" className="hidden" />
      </div>

      {msg && <p role="alert" className={`text-sm ${msg.startsWith("Too many") ? "text-amber-700" : "text-red-700"}`}>{msg}</p>}
      {rateLimited && <p className="text-xs text-slate-500">Please wait a few minutes before trying again.</p>}

      <button type="submit" disabled={busy} className="w-full rounded-md bg-gold-500 py-3 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">
        {busy ? "Submitting..." : "Submit Registration"}
      </button>
    </form>
  );
}
