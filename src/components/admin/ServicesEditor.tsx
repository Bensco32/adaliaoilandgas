"use client";

import { useState } from "react";
import { adminPut } from "@/components/admin/utils";
import type { ServiceRecord } from "@/lib/settings";

function statusFor(verified: boolean) {
  return verified
    ? { label: "Verified", badge: "bg-green-100 text-green-800" }
    : { label: "Not verified", badge: "bg-slate-100 text-slate-500" };
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
const selectClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

function ServiceRow({
  service,
  onEdit,
  onDelete
}: {
  service: ServiceRecord;
  onEdit: (record: ServiceRecord) => void;
  onDelete: (id: string) => void;
}) {
  const status = statusFor(service.verified);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-navy-900">{service.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {service.division} — image: {service.image || "none"}
          </p>
          <p className="mt-1 text-xs text-slate-600">{service.description || "(no description)"}</p>
        </div>
        <div className="flex gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}>{status.label}</span>
          <button type="button" onClick={() => onEdit(service)} className="rounded-md border border-gold-500 px-3 py-1 text-xs font-semibold text-gold-600 hover:bg-gold-50">
            Edit
          </button>
          <button type="button" onClick={() => onDelete(service.id)} className="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function ServicesEditor({ services }: { services: ServiceRecord[] }) {
  const [records, setRecords] = useState<ServiceRecord[]>(services);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [form, setForm] = useState<Omit<ServiceRecord, "id">>({
    title: "",
    division: "",
    description: "",
    objectives: [],
    capabilities: [],
    image: "",
    verified: false
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function lines(value: string): string[] {
    return value.split("\n").map((v) => v.trim()).filter(Boolean);
  }

  async function save() {
    if (!editing) return;
    setBusy(true);
    setMsg("");
    const next = records.map((s) => (s.id === editing.id ? { ...s, ...form } : s));
    setBusy(true);
    const result = await adminPut("services", next);
    setBusy(false);
    setRecords(next);
    setEditing(null);
    setMsg(result.ok ? `Saved: ${form.title || editing.title}` : `Error: ${result.error}`);
    if (result.ok) setTimeout(() => setMsg(""), 2500);
  }

  async function add() {
    if (!form.title) {
      setMsg("Please enter a service title.");
      return;
    }
    const newRecord: ServiceRecord = {
      id: `svc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      ...form
    };
    const next = [...records, newRecord];
    const result = await adminPut("services", next);
    if (result.ok) {
      setRecords(next);
      setForm({ title: "", division: "", description: "", objectives: [], capabilities: [], image: "", verified: false });
      setMsg(`Added: ${newRecord.title}`);
      setTimeout(() => setMsg(""), 2500);
    } else {
      setMsg(`Error: ${result.error}`);
    }
  }

  function remove(id: string) {
    const next = records.filter((s) => s.id !== id);
    void adminPut("services", next);
    setRecords(next);
    if (editing?.id === id) setEditing(null);
  }

  function openEditor(record: ServiceRecord) {
    setEditing(record);
    setForm({ ...record });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Services</h1>
          <p className="mt-1 text-sm text-slate-500">{records.length} service record(s). Only verified services appear on the public services pages.</p>
        </div>
        <button onClick={save} disabled={busy || !editing} className="rounded-md bg-gold-500 px-5 py-2.5 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">
          {busy ? "Saving..." : "Save Changes"}
        </button>
      </div>
      {msg && <p role="status" className={`text-sm ${msg.startsWith("Error") ? "text-red-700" : "text-green-700"}`}>{msg}</p>}

      <div className="space-y-3">
        {records.map((s) => (
          <ServiceRow key={s.id} service={s} onEdit={openEditor} onDelete={remove} />
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy-900">{editing ? "Edit Service" : "Add New Service"}</h2>
        {editing && <p className="mt-1 text-sm text-slate-500">Editing: {editing.title}</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={200} className={inputClass} />
          </Field>
          <Field label="Division">
            <select value={form.division} onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))} className={selectClass}>
              <option value="">Select division</option>
              <option value="drilling-services">ADALIA DRILLING SERVICES</option>
              <option value="crude-lifting-marine-logistics">ADALIA CRUDE LIFTING, MARINE &amp; LOGISTICS</option>
              <option value="gas">ADALIA GAS</option>
              <option value="petroleum-supply">ADALIA PETROLEUM SUPPLY</option>
            </select>
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className={inputClass} />
          </Field>
          <Field label="Objectives (one per line)">
            <textarea value={form.objectives.join("\n")} onChange={(e) => setForm((f) => ({ ...f, objectives: lines(e.target.value) }))} rows={4} className={inputClass} />
          </Field>
          <Field label="Operational capabilities (one per line)">
            <textarea value={form.capabilities.join("\n")} onChange={(e) => setForm((f) => ({ ...f, capabilities: lines(e.target.value) }))} rows={4} className={inputClass} />
          </Field>
          <Field label="Image (URL or /images path)">
            <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="Publish (verified)">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.verified} onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))} />
              {form.verified ? "Service is published" : "Service is not published yet"}
            </label>
          </Field>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={save} disabled={busy || !editing} className="rounded-md bg-gold-500 px-5 py-2 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">
            {editing ? "Save Changes" : "Save"}
          </button>
          <button type="button" onClick={add} disabled={busy} className="rounded-md bg-navy-900 px-5 py-2 font-semibold text-white hover:bg-navy-800">
            {editing ? "Add New Service" : "Add Service"}
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
