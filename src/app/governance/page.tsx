import type { Metadata } from "next";
import { getGovernanceDocs } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corporate Governance & Business Ethics",
  description:
    "Corporate governance policies, code of conduct, anti-bribery, conflict of interest, whistleblower procedures and corporate responsibility of ADALIA OIL AND GAS LTD.",
  keywords: ["ADALIA OIL AND GAS LTD", "governance", "code of conduct", "anti-bribery", "whistleblowing", "business ethics"]
};

const SUMMARY = [
  { label: "Code of Conduct", href: "#code-of-conduct" },
  { label: "Anti-Bribery & Anti-Corruption Policy", href: "#anti-bribery" },
  { label: "Conflict of Interest Policy", href: "#conflict-of-interest" },
  { label: "Ethical Business Practices", href: "#ethics" },
  { label: "Whistleblowing & Reporting", href: "#whistleblowing" },
  { label: "Supplier & Contractor Conduct", href: "#supplier-conduct" },
  { label: "Corporate Responsibility", href: "#corporate-responsibility" }
];

export default function GovernancePage() {
  const docs = getGovernanceDocs();
  const published = docs.filter((d) => d.verified && d.status === "published");
  const unpublished = docs.filter((d) => !(d.verified && d.status === "published"));

  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Corporate Governance &amp; Business Ethics</h1>
        <p className="mt-3 text-gold-300">Integrity, transparency and accountability in every operation</p>
      </div>

      <section id="governance" className="section-padding bg-white">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">Corporate Governance</p>
          <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">DOCUMENTS & POLICIES</h2>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {SUMMARY.map((s) => (
              <a key={s.label} href={s.href} className="text-gold-600 hover:underline">
                {s.label}
              </a>
            ))}
          </div>

          <div className="mt-10 space-y-4">
            {published.length === 0 ? (
              <p className="text-slate-600">Governance policies are being reviewed and will be published here once verified by management. This page does not display application or draft documents as final policies.</p>
            ) : (
              published.map((doc) => (
                <div key={doc.id} id={doc.category.toLowerCase().replace(/[^a-z]+/g, "-")} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold text-navy-900">{doc.title}</h3>
                    {doc.documentUrl && (
                      <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        Download policy document
                      </a>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Category: {doc.category} · Version: {doc.version}</p>
                  <div className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-slate-700">{doc.content}</div>
                </div>
              ))
            )}
            {unpublished.map((doc) => (
              <div key={doc.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5 opacity-60">
                <p className="text-base font-semibold text-navy-900">{doc.title}</p>
                <p className="mt-2 text-sm text-slate-500">This document is not yet published on the public site. Status: {doc.status}.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
