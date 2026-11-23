import { getCertificatesExpiringSoon, getComplianceCertificates, getEnquiries, getHsePolicies, getGovernanceDocs, getProjects, getServices, getSupplierRegistrations, loadSettings } from "@/lib/settings";
import type { EnquiryRecord } from "@/lib/settings";

function formatDate(value: string | null): string {
  if (!value) return "Not set";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}

function Card({ title, value, subtext }: { title: string; value: string; subtext?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-navy-900">{value}</p>
      {subtext && <p className="mt-1 text-sm text-slate-500">{subtext}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const settings = loadSettings();
  const company = settings.company;
  const enquiries = getEnquiries();
  const unread = enquiries.filter((e) => !e.read).length;
  const suppliers = getSupplierRegistrations();
  const pendingSuppliers = suppliers.filter((s) => s.status === "pending").length;
  const services = getServices();
  const projects = getProjects();
  const certificates = getComplianceCertificates();
  const issuedVerified = certificates.filter((c) => c.status === "issued" && c.verified).length;
  const expiringSoon = getCertificatesExpiringSoon(90);
  const hsePolicies = getHsePolicies();
  const governanceDocs = getGovernanceDocs();
  const publishedHse = hsePolicies.filter((p) => p.verified && p.status === "published").length;
  const publishedGov = governanceDocs.filter((d) => d.verified && d.status === "published").length;

  const recentActivity = settings.activity.slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Manage {company.name} ({company.slogan}).</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Unread enquiries" value={String(unread)} />
        <Card title="Supplier applications pending" value={String(pendingSuppliers)} />
        <Card title="Published services" value={String(services.filter((s) => s.verified).length)} />
        <Card title="Published projects" value={String(projects.filter((p) => p.verified).length)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Certificates verified & issued" value={String(issuedVerified)} />
        <Card title="Certificates expiring within 90 days" value={String(expiringSoon.length)} />
        <Card title="Published HSE policies" value={String(publishedHse)} />
        <Card title="Published governance docs" value={String(publishedGov)} />
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy-900">Recent activity</h2>
          {recentActivity.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No admin activity yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="text-gold-500">•</span>
                  <span className="text-slate-800"><span className="font-medium">{a.action}</span>{a.detail ? ` — ${a.detail}` : ""}</span>
                  <span className="ml-auto text-xs text-slate-400">{formatDate(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy-900">Certificates expiring soon</h2>
          {expiringSoon.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">None within the next 90 days.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {expiringSoon.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{c.title}</span>
                  <span className="text-xs text-red-600">{formatDate(c.expiryDate)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-slate-400">Update expiry dates in <a href="/admin/compliance" className="text-gold-600 hover:underline">Compliance</a>.</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy-900">Recent enquiries</h2>
          {enquiries.slice(0, 5).map((e: EnquiryRecord) => (
            <div key={e.id} className="mt-3 text-sm">
              <p className="text-slate-800"><span className="font-medium">{e.fullName}</span> — {e.subject}</p>
              <p className="text-slate-500">{e.email}{e.country ? ` · ${e.country}` : ""}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDate(e.receivedAt)} · {e.read ? "read" : "unread"}</p>
            </div>
          ))}
          {enquiries.length === 0 && <p className="mt-3 text-sm text-slate-500">No enquiries recorded yet.</p>}
        </section>
      </div>
    </div>
  );
}
