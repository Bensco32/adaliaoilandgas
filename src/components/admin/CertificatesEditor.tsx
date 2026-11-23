"use client";

import { useState } from "react";
import { adminPut, adminUpload, adminDelete } from "@/components/admin/utils";
import type { ComplianceCertificate } from "@/lib/settings";

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
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";
const selectClass = inputClass;

function CertRow({
  cert,
  onEdit,
  onDelete,
  onToggleVerified
}: {
  cert: ComplianceCertificate;
  onEdit: (c: ComplianceCertificate) => void;
  onDelete: (id: string) => void;
  onToggleVerified: (c: ComplianceCertificate) => void;
}) {
  const isExpiring = cert.expiryDate && (Date.parse(cert.expiryDate) - Date.now()) / 86_400_000 < 90;
  const statusLabel = cert.status === "issued" ? "Issued" : cert.status === "application" ? "Application pending" : cert.status === "pending_verification" ? "Pending verification" : "Not submitted";
  const badgeClass = cert.verified && cert.status === "issued"
    ? "bg-green-100 text-green-800"
    : isExpiring && cert.status === "issued" && !cert.verified
      ? "bg-amber-100 text-amber-800"
      : cert.status === "issued" && !cert.verified
        ? "bg-red-100 text-red-800"
        : "bg-slate-100 text-slate-500";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-navy-900">{cert.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            Category: {cert.category} · {cert.authority}
            {cert.reference ? ` · Ref: ${cert.reference}` : ""}
            {cert.expiryDate ? ` · Expires: ${cert.expiryDate}` : ""}
          </p>
          {cert.documentUrl && <p className="mt-1 text-xs text-blue-600">Certificate document: {cert.documentUrl}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>{statusLabel}{isExpiring && cert.status === "issued" && !cert.verified ? " — expiring soon" : ""}</span>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <input type="checkbox" checked={cert.verified} onChange={() => onToggleVerified(cert)} />
            Published
          </label>
          <button type="button" onClick={() => onEdit(cert)} className="rounded-md border border-gold-500 px-3 py-1 text-xs font-semibold text-gold-600 hover:bg-gold-50">Edit</button>
          <button type="button" onClick={() => onDelete(cert.id)} className="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </div>
      </div>
    </div>
  );
}

export function CertificatesEditor({ certificates }: { certificates: ComplianceCertificate[] }) {
  const [records, setRecords] = useState<ComplianceCertificate[]>(certificates);
  const [editing, setEditing] = useState<ComplianceCertificate | null>(null);
  const [form, setForm] = useState<ComplianceCertificate>({
    id: "",
    title: "",
    category: "Other permit",
    authority: "",
    reference: "",
    issueDate: null,
    expiryDate: null,
    status: "application",
    verified: false,
    documentUrl: "",
    certificateId: "",
    note: ""
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function save() {
    if (!editing) return;
    const next = records.map((c) => (c.id === editing.id ? { ...c, ...form } : c));
    void saveAll(next);
    setRecords(next);
    setEditing(null);
  }

  async function saveAll(next: ComplianceCertificate[]) {
    const result = await adminPut("compliance", next);
    if (!result.ok) setMsg(`Error: ${result.error}`);
    else setMsg(result.ok ? "Certificates saved." : "");
    setTimeout(() => setMsg(""), 2500);
  }

  async function uploadDoc(files: FileList) {
    setBusy(true);
    const result = await adminUpload([...files]);
    setBusy(false);
    if (!result.ok) {
      setMsg(`Error: ${result.error}`);
      return;
    }
    const path = result.data?.[0]?.path || "";
    setMsg("Certificate document uploaded: " + path);
    setForm((f) => ({ ...f, documentUrl: path, certificateId: path.split("/").pop() || "" }));
    setTimeout(() => setMsg(""), 2500);
  }

  function toggleVerified(cert: ComplianceCertificate) {
    const next = records.map((c) =>
      c.id === cert.id ? { ...c, verified: !c.verified, status: c.verified ? "issued" : c.status } : c
    );
    void saveAll(next);
    setRecords(next);
  }

  async function add() {
    if (!form.title) {
      setMsg("Please enter a certificate title.");
      return;
    }
    const newRecord: ComplianceCertificate = {
      ...form,
      id: `cert-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      verified: false
    };
    const next = [...records, newRecord];
    const result = await adminPut("compliance", next);
    if (result.ok) {
      setRecords(next);
      setForm({ id: "", title: "", category: "Other permit", authority: "", reference: "", issueDate: null, expiryDate: null, status: "application", verified: false, documentUrl: "", certificateId: "", note: "" });
      setMsg(`Added: ${newRecord.title}`);
      setTimeout(() => setMsg(""), 2500);
    } else {
      setMsg(`Error: ${result.error}`);
    }
  }

  function remove(id: string) {
    const next = records.filter((c) => c.id !== id);
    void adminPut("compliance", next);
    setRecords(next);
    if (editing?.id === id) setEditing(null);
  }

  function openEditor(cert: ComplianceCertificate) {
    setEditing(cert);
    setForm({ ...cert });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Compliance &amp; Certifications</h1>
          <p className="mt-1 text-sm text-slate-500">{records.length} certification record(s). Only verified, issued certificates appear publicly. Expiry dates trigger admin reminders.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={busy || !editing} className="rounded-md bg-gold-500 px-5 py-2.5 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">
            {busy ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
      {msg && <p role="status" className={`text-sm ${msg.startsWith("Error") ? "text-red-700" : "text-green-700"}`}>{msg}</p>}

      <div className="space-y-3">
        {records.map((c) => (
          <CertRow key={c.id} cert={c} onEdit={openEditor} onDelete={remove} onToggleVerified={toggleVerified} />
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy-900">{editing ? "Edit Certification" : "Add New Certification"}</h2>
        {editing && <p className="mt-1 text-sm text-slate-500">Editing: {editing.title}</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Certificate / permit title">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={200} className={inputClass} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={selectClass}>
              <option value="CAC registration">CAC registration</option>
              <option value="NUPRC permit">NUPRC permit</option>
              <option value="NMDPRA licence">NMDPRA licence</option>
              <option value="Environmental approval">Environmental approval</option>
              <option value="Safety certification">Safety certification</option>
              <option value="Other permit">Other permit</option>
            </select>
          </Field>
          <Field label="Issuing authority">
            <input value={form.authority} onChange={(e) => setForm((f) => ({ ...f, authority: e.target.value }))} maxLength={300} className={inputClass} />
          </Field>
          <Field label="Reference number">
            <input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} maxLength={200} className={inputClass} />
          </Field>
          <Field label="Issue date">
            <input type="date" value={form.issueDate || ""} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value || null }))} className={inputClass} />
          </Field>
          <Field label="Expiry date">
            <input type="date" value={form.expiryDate || ""} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value || null }))} className={inputClass} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ComplianceCertificate["status"] }))} className={selectClass}>
              <option value="issued">Issued (published when verified)</option>
              <option value="application">Application in progress</option>
              <option value="not_submitted">Not yet submitted</option>
              <option value="pending_verification">Pending verification</option>
            </select>
          </Field>
          <Field label="Published (verified)">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.verified} onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))} />
              {form.verified ? "Show on public Compliance page" : "Do not show on public page"}
            </label>
          </Field>
          <Field label="Certificate document (upload)">
            <input type="file" accept="application/pdf,image/png,image/jpeg,image/gif,image/webp" onChange={(e) => e.target.files && uploadDoc(e.target.files)} className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-sm" />
            {form.documentUrl && <span className="mt-1 block text-xs text-blue-600">{form.documentUrl}</span>}
          </Field>
          <Field label="Note (shown when pending or unverified)">
            <textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} rows={3} className={inputClass} />
          </Field>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={add} disabled={busy} className="rounded-md bg-navy-900 px-5 py-2 font-semibold text-white hover:bg-navy-800">
            {editing ? "Add New Certification" : "Add Certification"}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-slate-300 px-5 py-2 font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          )}
        </div>
        {records.length > 0 && (
          <p className="mt-4 text-xs text-slate-500">Only certificates marked "Published" with status "Issued" appear on the public Compliance page. Do not fabricate certificate numbers: applications and pending approvals are shown as such.</p>
        )}
      </section>
    </div>
  );
}

export { adminDelete };
