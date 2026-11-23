import { getHsePolicies } from "@/lib/settings";

const CATEGORY_ORDER = [
  "Health and safety policy",
  "Environmental protection policy",
  "Workplace safety procedures",
  "Risk assessment and hazard identification",
  "Emergency preparedness and response",
  "Incident reporting",
  "Waste management",
  "Pollution prevention",
  "Employee safety training",
  "Contractor safety management"
];

export function HsePoliciesList() {
  const published = getHsePolicies().filter((p) => p.verified && p.status === "published");
  const unverified = getHsePolicies().filter((p) => !(p.verified && p.status === "published"));

  const byCategory = new Map<string, typeof published>();
  for (const policy of published) {
    const list = byCategory.get(policy.category) || [];
    list.push(policy);
    byCategory.set(policy.category, list);
  }

  return (
    <div className="space-y-10">
      {CATEGORY_ORDER.map((category) => {
        const policies = byCategory.get(category);
        if (!policies || policies.length === 0) return null;
        return (
          <section key={category} id={category.toLowerCase().replace(/[^a-z0-9-]+/g, "-")} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-navy-900">{category}</h3>
            {policies.map((policy) => (
              <div key={policy.id} className="mt-4 space-y-2">
                <p className="font-medium text-navy-900">{policy.title}</p>
                <p className="text-xs text-slate-500">Version {policy.version} · Effective {policy.effectiveDate || "Not set"}</p>
                <div className="whitespace-pre-wrap text-slate-700">{policy.content}</div>
                {policy.documentUrl && (
                  <a href={policy.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    Download policy document
                  </a>
                )}
              </div>
            ))}
          </section>
        );
      })}
      {unverified.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-navy-900">Policies under review</h3>
          <p className="mt-2 text-sm text-slate-500">
            Additional policies are being drafted and will be published here when verified and approved by management.
          </p>
        </section>
      )}
      {published.length === 0 && unverified.length === 0 && (
        <p className="text-slate-600">HSE policies are being developed. They will be published here once verified by management.</p>
      )}
    </div>
  );
}
