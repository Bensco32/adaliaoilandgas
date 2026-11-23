"use client";

import { useState } from "react";
import { adminDelete, adminMarkEnquiryRead } from "@/components/admin/utils";
import type { EnquiryRecord } from "@/lib/settings";

function formatDate(value: string | null): string {
  if (!value) return "Not set";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 16);
}

function readClass(read: boolean): string {
  return read ? "bg-slate-100" : "bg-amber-50";
}

export function EnquiriesEditor({ enquiries }: { enquiries: EnquiryRecord[] }) {
  const [records, setRecords] = useState<EnquiryRecord[]>(enquiries);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function toggleRead(id: string) {
    setBusy(true);
    setRecords(records.map((e) => (e.id === id ? { ...e, read: !e.read } : e)));
    await adminMarkEnquiryRead(id);
    setBusy(false);
  }

  async function remove(id: string) {
    setBusy(true);
    const result = await adminDelete("enquiries", id);
    setBusy(false);
    if (result.ok) setRecords(records.filter((e) => e.id !== id));
    setMsg(result.ok ? "Enquiry deleted." : `Error: ${result.error}`);
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Contact Enquiries</h1>
          <p className="mt-1 text-sm text-slate-500">{records.length} recorded enquir{records.length === 1 ? "y" : "ies"}. {records.filter((e) => !e.read).length} unread.</p>
        </div>
      </div>
      {msg && <p role="status" className={`text-sm ${msg.startsWith("Error") ? "text-red-700" : "text-green-700"}`}>{msg}</p>}

      {records.length === 0 ? (
        <p className="text-sm text-slate-500">No enquiries recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {records.map((e) => (
            <div key={e.id} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${readClass(e.read)}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-navy-900">
                    {e.fullName} · <span className="font-normal text-slate-600">{e.subject}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {e.email}
                    {e.phone ? ` · ${e.phone}` : ""}
                    {e.companyName ? ` · ${e.companyName}` : ""}
                    {e.country ? ` · ${e.country}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(e.receivedAt)} · {e.read ? "read" : "unread"} · division: {e.division}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Email: <span className="font-medium">{e.delivery.email}</span> · WhatsApp: <span className="font-medium">{e.delivery.whatsapp}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => toggleRead(e.id)} disabled={busy} className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                    {e.read ? "Mark unread" : "Mark read"}
                  </button>
                  <button onClick={() => remove(e.id)} disabled={busy} className="rounded-md border border-red-300 px-4 py-2 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
                    Delete
                  </button>
                  {e.message && (
                    <button onClick={() => setOpenId((id) => (id === e.id ? null : e.id))} className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
                      {openId === e.id ? "Hide message" : "View message"}
                    </button>
                  )}
                </div>
              </div>
              {openId === e.id && e.message && (
                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Message</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{e.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
