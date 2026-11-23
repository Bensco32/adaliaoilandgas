import type { Metadata } from "next";
import { getCertificatesExpiringSoon, getComplianceByCategory, getComplianceCertificates } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compliance & Certifications",
  description:
    "Compliance and certification status for ADALIA OIL AND GAS LTD. Verified, issued certificates only. Registration is not a guarantee of certification — see status of each entry.",
  keywords: ["ADALIA OIL AND GAS LTD", "compliance", "certifications", "CAC registration", "oil and gas Nigeria"]
};

function formatDate(value: string | null): string {
  if (!value) return "Not set";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}

const REGULATORY_NOTES: Array<{ category: string; note: string }> = [
  { category: "CAC registration", note: "Required for a registered corporate entity. Entries marked issued reflect a confirmed certificate and registration number." },
  { category: "NUPRC permit", note: "Applicability to exploration, production or E&P activities depends on jurisdiction and activity. Verify with the applicable regulator before publication." },
  { category: "NMDPRA licence", note: "Verify applicability to the services offered with the regulator. Publications shown as issued are marked verified." },
  { category: "Environmental approval", note: "Environmental compliance typically applies to activities such as exploration, production, decommissioning and any activity that may affect the environment. Applicability must be verified per activity and site." },
  { category: "Safety certification", note: "Safety certifications are displayed only when verified and issued. Adalia does not present application or pending approvals as active certifications." },
  { category: "Other permit", note: "State-level operating licences, vendor registration, port clearance and operator agreements are managed separately by relevant parties. Verify each with the issuing authority." }
];

export default function CompliancePage() {
  const byCategory = getComplianceByCategory();
  const certificates = getComplianceCertificates();
  const expiringSoon = getCertificatesExpiringSoon(90);
  const verifiedIssued = certificates.filter((c) => c.verified && c.status === "issued").length;
  const notYetIssued = certificates.length - verifiedIssued;

  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Compliance &amp; Certifications</h1>
        <p className="mt-3 text-gold-300">Verified, issued certificates only — registrations and applications are marked as such</p>
      </div>

      <section id="compliance" className="section-padding bg-white">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">Regulatory Position</p>
            <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">COMPLIANCE STATUS OVERVIEW</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-700">{verifiedIssued}</p>
                <p className="text-sm text-slate-600">Verified &amp; issued certificates</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-700">{expiringSoon.length}</p>
                <p className="text-sm text-slate-600">Certificates expiring within 90 days</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-500">{notYetIssued}</p>
                <p className="text-sm text-slate-600">Applications, pending or not yet registered</p>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-12">
            {Object.entries(byCategory).map(([category, certs]) => (
              <div key={category}>
                <h3 className="text-xl font-semibold text-navy-900">{category}</h3>
                <div className="mt-4 space-y-3">
                  {certs.map((cert) => (
                    <div
                      key={cert.id}
                      className={`rounded-xl border p-5 ${cert.verified && cert.status === "issued" ? "border-green-300 bg-green-50/60" : "border-slate-200 bg-slate-50"}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-navy-900">{cert.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Authority: {cert.authority}
                            {cert.reference ? ` · Ref: ${cert.reference}` : ""}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-4 py-1 text-xs font-semibold ${
                            cert.verified && cert.status === "issued" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {cert.verified && cert.status === "issued" ? "Verified &amp; issued" : cert.status === "application" ? "Application pending" : "Pending verification"}
                        </span>
                      </div>
                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="text-xs font-medium text-slate-500">Issue date</dt>
                          <dd className="text-slate-700">{formatDate(cert.issueDate)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-500">Expiry date</dt>
                          <dd className="text-slate-700">{formatDate(cert.expiryDate)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-500">Status</dt>
                          <dd className="text-slate-700">{cert.status === "application" ? "Application in progress" : cert.status === "issued" && cert.verified ? "Issued (verified)" : cert.status === "issued" ? "Issued (unverified)" : "Pending"}</dd>
                        </div>
                      </dl>
                      {cert.note && <p className="mt-3 text-sm text-slate-600">{cert.note}</p>}
                      {cert.documentUrl && (
                        <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          Download certificate document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {expiringSoon.length > 0 && (
            <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="text-lg font-semibold text-amber-800">Certificates expiring within 90 days</h3>
              <ul className="mt-3 space-y-2">
                {expiringSoon.map((c) => (
                  <li key={c.id} className="text-sm text-amber-800">
                    {c.title} — expiring {formatDate(c.expiryDate)}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-amber-700">Admin will review and update expiry dates and documentation. New issues will be published here when verified.</p>
            </div>
          )}

          <div className="mt-12">
            <h3 className="text-xl font-semibold text-navy-900">Regulatory Notes by Activity</h3>
            <p className="mt-4 text-slate-600">
              Regulatory requirements apply to specific activities and jurisdictions. Applicability to the services Adalia advertises must be verified with the applicable regulator before publication.
            </p>
            <div className="mt-6 space-y-4">
              {REGULATORY_NOTES.map((note) => (
                <p key={note.category} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <span className="font-semibold text-navy-900">{note.category}:</span> {note.note}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
