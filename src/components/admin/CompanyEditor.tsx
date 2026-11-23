"use client";

import { useMemo, useState } from "react";
import { adminPut } from "@/components/admin/utils";
import type { CompanyProfile, ManagementMember } from "@/lib/settings";

type Status = { label: string; pending: boolean };

function statusFor(requires: boolean, verified: boolean): Status {
  return { label: requires ? (verified ? "Published" : "Pending verification") : "Published", pending: requires && !verified };
}

function Field({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";
const textareaClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

export function CompanyEditor({ initial }: { initial: CompanyProfile }) {
  const [form, setForm] = useState<CompanyProfile>(initial);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const update = <K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setManagement = (members: ManagementMember[]) => setForm((f) => ({ ...f, management: members }));

  const statuses = useMemo(() => ({
    address: statusFor(form.addressRequiresVerification, form.addressVerified),
    phone: statusFor(form.phoneRequiresVerification, form.phoneVerified),
    email: statusFor(form.emailRequiresVerification, form.emailVerified),
    rcNumber: statusFor(form.rcNumberRequiresVerification, form.rcNumberVerified)
  }), [form]);

  async function save() {
    setBusy(true);
    setMsg("");
    const result = await adminPut("company", form);
    setBusy(false);
    setMsg(result.ok ? "Company profile saved." : `Error: ${result.error}`);
    if (result.ok) setTimeout(() => setMsg(""), 3000);
  }

  function addMember() {
    setManagement([...form.management, { name: "", title: "", bio: "", verified: false }]);
  }

  function removeMember(index: number) {
    setManagement(form.management.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Company Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the registered company identity shown on {form.name || "the website"}.</p>
        </div>
        <button onClick={save} disabled={busy} className="rounded-md bg-gold-500 px-5 py-2.5 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">
          {busy ? "Saving..." : "Save Company Profile"}
        </button>
      </div>
      {msg && <p role="status" className={`text-sm ${msg.startsWith("Error") ? "text-red-700" : "text-green-700"}`}>{msg}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy-900">Identity & Contact</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <input value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={120} className={inputClass} />
          </Field>
          <Field label="Slogan">
            <input value={form.slogan} onChange={(e) => update("slogan", e.target.value)} maxLength={120} className={inputClass} />
          </Field>
          <Field label="Website">
            <input value={form.website} onChange={(e) => update("website", e.target.value)} maxLength={200} className={inputClass} />
          </Field>
          <Field label="Registered office address" note={`Status: ${statuses.address.label}`}>
            <textarea value={form.address} onChange={(e) => update("address", e.target.value)} rows={3} className={textareaClass} />
          </Field>
          <Field label="Official telephone number" note={`Status: ${statuses.phone.label}`}>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={100} className={inputClass} />
          </Field>
          <Field label="Official email address" note={`Status: ${statuses.email.label}`}>
            <input value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={200} className={inputClass} />
          </Field>
          <Field label="CAC registration number" note={`Status: ${statuses.rcNumber.label}`}>
            <input value={form.rcNumber} onChange={(e) => update("rcNumber", e.target.value)} maxLength={100} className={inputClass} />
          </Field>
          <Field label="Core values (one per line)">
            <textarea value={form.coreValues.join("\n")} onChange={(e) => update("coreValues", e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))} rows={6} className={textareaClass} />
          </Field>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Contact & Registration Verification</h3>
          <p className="mt-2 text-sm text-slate-600">
            Contact details are only published once verified. Values below may be entered and will be visible to admins immediately.
          </p>
          <div className="mt-4 grid gap-2">
            {(["address", "phone", "email", "rcNumber"] as const).map((key) => {
              const s = statuses[key];
              const v = form[`${key}Verified`] as boolean;
              return (
                <div key={key} className="flex items-center justify-between gap-4">
                  <label className="text-sm font-medium capitalize text-slate-700">{key === "rcNumber" ? "RC number" : key}</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={v}
                      onChange={(e) => update(`${key}Verified` as keyof CompanyProfile, e.target.checked)}
                    />
                    {s.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy-900">Mission, Vision and Objectives</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Mission">
            <textarea value={form.mission} onChange={(e) => update("mission", e.target.value)} rows={5} className={textareaClass} />
          </Field>
          <Field label="Vision">
            <textarea value={form.vision} onChange={(e) => update("vision", e.target.value)} rows={5} className={textareaClass} />
          </Field>
        </div>
        <Field label="Foundation statement">
          <textarea value={form.foundation} onChange={(e) => update("foundation", e.target.value)} rows={2} className={textareaClass} />
        </Field>
        <Field label="Corporate objectives (one per line)">
          <textarea value={form.objectives.join("\n")} onChange={(e) => update("objectives", e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))} rows={6} className={textareaClass} />
        </Field>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy-900">Management &amp; Leadership</h2>
        {form.management.map((m, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input value={m.name} onChange={(e) => setManagement(form.management.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className={inputClass} />
              </Field>
              <Field label="Title/role">
                <input value={m.title} onChange={(e) => setManagement(form.management.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} className={inputClass} />
              </Field>
              <Field label="Biography">
                <textarea value={m.bio} onChange={(e) => setManagement(form.management.map((x, j) => (j === i ? { ...x, bio: e.target.value } : x)))} rows={3} className={textareaClass} />
              </Field>
              <Field label="LinkedIn URL">
                <input value={m.linkedin || ""} onChange={(e) => setManagement(form.management.map((x, j) => (j === i ? { ...x, linkedin: e.target.value } : x)))} className={inputClass} />
              </Field>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={m.verified} onChange={(e) => setManagement(form.management.map((x, j) => (j === i ? { ...x, verified: e.target.checked } : x)))} />
              Verified (eligible for publication)
            </label>
            <button type="button" onClick={() => removeMember(i)} className="mt-3 text-sm text-red-600 hover:underline">Remove</button>
          </div>
        ))}
        <div className="mt-6">
          <button type="button" onClick={addMember} className="rounded-md border border-gold-500 px-4 py-2 text-sm font-semibold text-gold-600 hover:bg-gold-50">Add management member</button>
          {form.management.length === 0 && <p className="mt-3 text-sm text-slate-500">No management details entered yet. This section will show a neutral note on the public site until verified details are added.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy-900">About Text</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="About sentence 1">
            <textarea value={form.about} onChange={(e) => update("about", e.target.value)} rows={3} className={textareaClass} />
          </Field>
          <Field label="About sentence 2">
            <textarea value={form.about2} onChange={(e) => update("about2", e.target.value)} rows={3} className={textareaClass} />
          </Field>
        </div>
        <Field label="Extended story paragraphs (one per line, separated by <br> preview)">
          <textarea value={form.aboutLong.join("\n\n")} onChange={(e) => update("aboutLong", e.target.value.split("\n\n").map((v) => v.trim()).filter(Boolean))} rows={12} className={textareaClass} />
        </Field>
        <Field label="Company HSE policy summary">
          <textarea value={form.hse} onChange={(e) => update("hse", e.target.value)} rows={3} className={textareaClass} />
        </Field>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy-900">Social Links</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="WhatsApp link">
            <input value={form.social.whatsapp} onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, whatsapp: e.target.value } }))} className={inputClass} />
          </Field>
          <Field label="Instagram link">
            <input value={form.social.instagram} onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, instagram: e.target.value } }))} className={inputClass} />
          </Field>
          <Field label="Facebook link">
            <input value={form.social.facebook} onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, facebook: e.target.value } }))} className={inputClass} />
          </Field>
        </div>
      </section>
    </div>
  );
}
