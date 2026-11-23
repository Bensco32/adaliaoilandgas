"use client";

import { useState } from "react";
import { adminPut, adminUpload } from "@/components/admin/utils";
import type { ProjectRecord } from "@/lib/settings";

function statusFor(verified: boolean) {
  return verified ? { label: "Published", badge: "bg-green-100 text-green-800" } : { label: "Not verified", badge: "bg-slate-100 text-slate-500" };
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
const textareaClass = inputClass;

function ProjectRow({ project, onEdit, onDelete }: { project: ProjectRecord; onEdit: (p: ProjectRecord) => void; onDelete: (id: string) => void }) {
  const status = statusFor(project.verified);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-navy-900">{project.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {project.status} · {project.location}{project.completionDate ? ` · ${project.completionDate}` : ""}
            {project.client ? ` · Client: ${project.client}` : ""}
          </p>
          {project.images.length > 0 && <p className="mt-1 text-xs text-slate-500">{project.images.length} image(s)</p>}
        </div>
        <div className="flex gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}>{status.label}</span>
          <button type="button" onClick={() => onEdit(project)} className="rounded-md border border-gold-500 px-3 py-1 text-xs font-semibold text-gold-600 hover:bg-gold-50">Edit</button>
          <button type="button" onClick={() => onDelete(project.id)} className="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </div>
      </div>
    </div>
  );
}

export function ProjectsEditor({ projects }: { projects: ProjectRecord[] }) {
  const [records, setRecords] = useState<ProjectRecord[]>(projects);
  const [editing, setEditing] = useState<ProjectRecord | null>(null);
  const [form, setForm] = useState<Omit<ProjectRecord, "id">>({
    title: "",
    location: "",
    description: "",
    client: "",
    partner: "",
    completionDate: null,
    status: "Not specified",
    images: [],
    verified: false
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function lines(value: string): string[] {
    return value.split("\n").map((v) => v.trim()).filter(Boolean);
  }

  function updateImages(newImages: string[]) {
    setForm((f) => ({ ...f, images: [...newImages] }));
  }

  async function save() {
    if (!editing) return;
    const next = records.map((p) => (p.id === editing.id ? { ...p, ...form } : p));
    setBusy(true);
    const result = await adminPut("projects", next);
    setBusy(false);
    setRecords(next);
    setEditing(null);
    setMsg(result.ok ? `Saved: ${form.title || editing.title}` : `Error: ${result.error}`);
    if (result.ok) setTimeout(() => setMsg(""), 2500);
  }

  async function add() {
    if (!form.title) {
      setMsg("Please enter a project title.");
      return;
    }
    const newRecord: ProjectRecord = {
      id: `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      ...form
    };
    const next = [...records, newRecord];
    const result = await adminPut("projects", next);
    if (result.ok) {
      setRecords(next);
      setForm({ title: "", location: "", description: "", client: "", partner: "", completionDate: null, status: "Not specified", images: [], verified: false });
      setMsg(`Added: ${newRecord.title}`);
      setTimeout(() => setMsg(""), 2500);
    } else {
      setMsg(`Error: ${result.error}`);
    }
  }

  async function uploadImages(files: FileList) {
    setBusy(true);
    const result = await adminUpload([...files]);
    setBusy(false);
    if (!result.ok) {
      setMsg(`Error: ${result.error}`);
      return;
    }
    const paths = result.data?.map((f) => f.path) || [];
    updateImages([...form.images, ...paths]);
  }

  function removeImage(index: number) {
    updateImages(form.images.filter((_, i) => i !== index));
  }

  function removeImageByPath(path: string) {
    updateImages(form.images.filter((p) => p !== path));
  }

  function remove(id: string) {
    const next = records.filter((p) => p.id !== id);
    void adminPut("projects", next);
    setRecords(next);
    if (editing?.id === id) setEditing(null);
  }

  function openEditor(project: ProjectRecord) {
    setEditing(project);
    setForm({ ...project, images: [...project.images] });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Projects &amp; Experience</h1>
          <p className="mt-1 text-sm text-slate-500">{records.length} project record(s). Only verified projects appear on the public projects page.</p>
        </div>
        <button onClick={save} disabled={busy || !editing} className="rounded-md bg-gold-500 px-5 py-2.5 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">
          {busy ? "Saving..." : "Save Changes"}
        </button>
      </div>
      {msg && <p role="status" className={`text-sm ${msg.startsWith("Error") ? "text-red-700" : "text-green-700"}`}>{msg}</p>}

      <div className="space-y-3">
        {records.map((p) => (
          <ProjectRow key={p.id} project={p} onEdit={openEditor} onDelete={remove} />
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy-900">{editing ? "Edit Project" : "Add New Project"}</h2>
        {editing && <p className="mt-1 text-sm text-slate-500">Editing: {editing.title}</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Project title">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={200} className={inputClass} />
          </Field>
          <Field label="Project location">
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} maxLength={300} className={inputClass} />
          </Field>
          <Field label="Client (if disclosed)">
            <input value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} maxLength={300} className={inputClass} />
          </Field>
          <Field label="Partner">
            <input value={form.partner} onChange={(e) => setForm((f) => ({ ...f, partner: e.target.value }))} maxLength={300} className={inputClass} />
          </Field>
          <Field label="Completion date">
            <input type="date" value={form.completionDate || ""} onChange={(e) => setForm((f) => ({ ...f, completionDate: e.target.value || null }))} className={inputClass} />
          </Field>
          <Field label="Status">
            <input value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} placeholder="Completed, In progress..." className={inputClass} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={5} className={textareaClass} />
          </Field>
          <Field label="Project photographs (upload)">
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" multiple onChange={(e) => e.target.files && uploadImages(e.target.files)} className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-sm" />
          </Field>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">Attached photograph URLs ({form.images.length})</label>
          <ul className="mt-2 space-y-2">
            {form.images.map((img, i) => (
              <li key={i} className="flex items-center justify-between gap-2 text-xs text-slate-600">
                <span className="truncate">{img}</span>
                <button type="button" onClick={() => removeImageByPath(img)} className="text-red-600 hover:underline">Remove</button>
              </li>
            ))}
          </ul>
          {form.images.length === 0 && <p className="mt-2 text-sm text-slate-500">No photos attached yet. Only publish projects once photos and details are verified.</p>}
        </div>
        <div className="mt-6">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.verified} onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))} />
            Publish this project (verified)
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={save} disabled={busy || !editing} className="rounded-md bg-gold-500 px-5 py-2 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">
              {editing ? "Save Changes" : "Save"}
            </button>
            <button type="button" onClick={add} disabled={busy} className="rounded-md bg-navy-900 px-5 py-2 font-semibold text-white hover:bg-navy-800">
              {editing ? "Add New Project" : "Add Project"}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-slate-300 px-5 py-2 font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
