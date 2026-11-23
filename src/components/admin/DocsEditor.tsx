"use client";

import { useState } from "react";
import { adminPut, adminUpload } from "@/components/admin/utils";
import type { GovernanceDocument, HsePolicyDocument, Settings } from "@/lib/settings";

type Doc = GovernanceDocument | HsePolicyDocument;
type Section = "hsePolicies" | "governanceDocs";

function statusLabel(doc: Doc): string {
  return doc.status === "published" ? "Published" : doc.status === "approved" ? "Approved" : doc.status === "draft" ? "Draft" : "Draft";
}

function badgeClass(doc: Doc): string {
  if (doc.verified && doc.status === "published") return "bg-green-100 text-green-800";
  if (doc.status === "published") return "bg-amber-100 text-amber-800";
  if (doc.verified) return "bg-blue-100 text-blue-800";
  return "bg-slate-100 text-slate-500";
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
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";
const selectClass = inputClass;

export function DocsEditor({ section, docs }: { section: Section; docs: Doc[] }) {
  const [records, setRecords] = useState<Doc[]>(docs);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [form, setForm] = useState<Doc>({
    id: "",
    title: "",
    category: "Policy",
    version: "1.0",
    effectiveDate: null,
    status: "draft",
    verified: false,
    documentUrl: "",
    content: ""
  } as Doc);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function saveAll(next: Doc[]) {
    const result = await adminPut(section, next);
    if (!result.ok) setMsg(`Error: ${result.error}`);
    else setMsg("Saved.");
    setTimeout(() => setMsg(""), 2500);
  }

  function save() {
    if (!editing) return;
    const next = records.map((d) => (d.id === editing.id ? { ...d, ...form } : d));
    void saveAll(next);
    setRecords(next);
    setEditing(null);
  }

  async function uploadDoc(files: FileList) {
    setBusy(true);
    const result = await adminUpload([...files]);
    setBusy(false);
    if (!result.ok) {
      setMsg(`Error: ${result.error}`);
      return;
    }
    setMsg("Document uploaded: " + (result.data?.[0]?.path || ""));
    setForm((f) => ({ ...f, documentUrl: result.data?.[0]?.path || "" }));
    setTimeout(() => setMsg(""), 2500);
  }

  function toggleVerified(doc: Doc) {
    const next = records.map((d) => (d.id === doc.id ? { ...d, verified: !d.verified } : d));
    void saveAll(next);
    setRecords(next);
  }

  async function add() {
    if (!form.title) {
      setMsg("Please enter a document title.");
      return;
    }
    const newRecord: Doc = {
      ...form,
      id: `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    } as Doc;
    const next = [...records, newRecord];
    const result = await adminPut(section, next);
    if (result.ok) {
      setRecords(next);
      setForm({ id: "", title: "", category: "Policy", version: "1.0", effectiveDate: null, status: "draft", verified: false, documentUrl: "", content: "" } as Doc);
      setMsg(`Added: ${newRecord.title}`);
      setTimeout(() => setMsg(""), 2500);
    } else {
      setMsg(`Error: ${result.error}`);
    }
  }

  function remove(id: string) {
    const next = records.filter((d) => d.id !== id);
    void saveAll(next);
    setRecords(next);
    if (editing?.id === id) setEditing(null);
  }

  function openEditor(doc: Doc) {
    setEditing(doc);
    setForm({ ...doc });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{section === "hsePolicies" ? "HSE Policies" : "Corporate Governance"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {records.length} document(s). Only verified, published documents appear publicly. Editable content is stored here and displayed under its category.
          </p>
        </div>
        <button onClick={save} disabled={busy || !editing} className="rounded-md bg-gold-500 px-5 py-2.5 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">
          {busy ? "Saving..." : "Save Changes"}
        </button>
      </div>
      {msg && <p role="status" className={`text-sm ${msg.startsWith("Error") ? "text-red-700" : "text-green-700"}`}>{msg}</p>}

      <div className="space-y-3">
        {records.map((d) => (
          <div key={d.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-900">{d.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {d.category} · v{d.version}
                  {d.effectiveDate ? ` · Effective: ${d.effectiveDate}` : ""}
                  {d.documentUrl ? ` · File: ${d.documentUrl}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(d)}`}>{statusLabel(d)}{d.verified ? " · verified" : ""}</span>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <input type="checkbox" checked={d.verified} onChange={() => toggleVerified(d)} />
                  Published
                </label>
                <button type="button" onClick={() => openEditor(d)} className="rounded-md border border-gold-500 px-3 py-1 text-xs font-semibold text-gold-600 hover:bg-gold-50">Edit</button>
                <button type="button" onClick={() => remove(d.id)} className="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
            {d.documentUrl && (
              <a href={d.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                View document ({d.title.split(" ")[0]})
              </a>
            )}
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy-900">{editing ? "Edit Document" : "Add New Document"}</h2>
        {editing && <p className="mt-1 text-sm text-slate-500">Editing: {editing.title}</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Document title">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={200} className={inputClass} />
          </Field>
          <Field label="Category">
            <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="Version">
            <input value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="Effective date">
            <input type="date" value={form.effectiveDate || ""} onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value || null }))} className={inputClass} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Doc["status"] }))} className={selectClass}>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Published (verified)">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.verified} onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))} />
              {form.verified ? "Show on public page" : "Do not show until verified"}
            </label>
          </Field>
          <Field label="Document file (upload)">
            <input type="file" accept="application/pdf,image/png,image/jpeg,image/gif,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => e.target.files && uploadDoc(e.target.files)} className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-sm" />
            {form.documentUrl && <span className="mt-1 block text-xs text-blue-600">{form.documentUrl}</span>}
          </Field>
          <Field label="Policy / content body (shown publicly when published)">
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={14} className={inputClass} />
          </Field>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={save} disabled={busy || !editing} className="rounded-md bg-gold-500 px-5 py-2 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">
            {editing ? "Save Changes" : "Save"}
          </button>
          <button type="button" onClick={add} disabled={busy} className="rounded-md bg-navy-900 px-5 py-2 font-semibold text-white hover:bg-navy-800">
            {editing ? "Add New Document" : "Add Document"}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-slate-300 px-5 py-2 font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export type { Doc, Section };
export type { Settings };
