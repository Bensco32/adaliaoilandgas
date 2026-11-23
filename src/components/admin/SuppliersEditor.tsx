"use client";

import { useState } from "react";
import { adminDelete, adminPut } from "@/components/admin/utils";
import type { SupplierRegistration } from "@/lib/settings";

function statusBadge(status: SupplierRegistration["status"]): { label: string; className: string } {
  if (status === "approved") return { label: "Approved", className: "bg-green-100 text-green-800" };
  if (status === "rejected") return { label: "Rejected", className: "bg-red-100 text-red-800" };
  return { label: "Pending review", className: "bg-amber-100 text-amber-800" };
}

function formatDate(value: string | null): string {
  if (!value) return "Not set";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 16);
}

export function SuppliersEditor({ registrations }: { registrations: SupplierRegistration[] }) {
  const [records, setRecords] = useState<SupplierRegistration[]>(registrations);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function setStatus(id: string, status: SupplierRegistration["status"], note?: string) {
    setBusy(true);
    setRecords(records.map((s) => (s.id === id ? { ...s, status, reviewedAt: new Date().toISOString(), note: note ?? s.note } : s)));
    setMsg("Status updated.");
  }

  async function save(rec: SupplierRegistration) {
    setBusy(true);
    const result = await adminPut("suppliers", records);
    setBusy(false);
    setMsg(result.ok ? "Saved." : `Error: ${result.error}`);
    setTimeout(() => setMsg(""), 2500);
  }

  function remove(id: string) {
    setRecords(records.filter((s) => s.id !== id));
    void adminPut("suppliers", records.filter((s) => s.id !== id));
    setMsg("Supplier removed.");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-navy-900">Supplier Registrations</h1>
      <p className="text-sm text-slate-500">{records.length} application(s). Registration does not guarantee approval or contract awards — review each application before approving.</p>
      {msg && <p role="status" className={`text-sm ${msg.startsWith("Error") ? "text-red-700" : "text-green-700"}`}>{msg}</p>}

      {records.length === 0 ? (
        <p className="text-sm text-slate-500">No supplier applications yet.</p>
      ) : (
        <div className="space-y-3">
          {records.map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy-900">{s.companyName || "(no company name)"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Submitted {formatDate(s.submittedAt)}
                    {s.cacRegistration ? ` · CAC: ${s.cacRegistration}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {s.contactPerson && `${s.contactPerson} · `}
                    {s.email || "(no email)"}
                    {s.phone ? ` · ${s.phone}` : ""}
                    {s.address ? ` · ${s.address}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(s.status).className}`}>{statusBadge(s.status).label}</span>
                  <button onClick={() => save(s)} disabled={busy} className="rounded-md bg-gold-500 px-4 py-2 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">Save</button>
                  <button onClick={() => setStatus(s.id, "approved")} disabled={busy} className="rounded-md border border-green-500 bg-green-50 px-4 py-2 font-semibold text-green-700 hover:bg-green-100">Approve</button>
                  <button onClick={() => setStatus(s.id, "rejected")} disabled={busy} className="rounded-md border border-red-500 bg-red-50 px-4 py-2 font-semibold text-red-700 hover:bg-red-100">Reject</button>
                  <button onClick={() => remove(s.id)} disabled={busy} className="rounded-md border border-red-300 px-4 py-2 font-semibold text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Services / products supplied</h3>
                  <p className="mt-1 text-sm text-slate-600">{s.servicesDescription || "(none provided)"}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contact &amp; Registration</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {s.contactPerson ? `${s.contactPerson} <${s.email}>` : s.email}
                    {s.phone ? ` · ${s.phone}` : ""}
                    {s.address ? ` · ${s.address}` : ""}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Supporting documents</h3>
                  {s.documents.length === 0 ? (
                    <p className="mt-1 text-sm text-slate-500">No documents attached.</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {s.documents.map((d) => (
                        <li key={d.path} className="text-sm">
                          <a href={d.path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{d.name}</a>
                          <span className="ml-2 text-xs text-slate-400">({d.uploadedAt ? new Date(d.uploadedAt).toISOString().slice(0, 10) : ""})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Review note</h3>
                  <textarea
                    value={s.note}
                    onChange={(e) => setRecords(records.map((x) => (x.id === s.id ? { ...x, note: e.target.value } : x)))}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-gold-500 focus:outline-none"
                    placeholder="Record reason for approval/rejection decision."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { adminDelete };
