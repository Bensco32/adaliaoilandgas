import type { Metadata } from "next";
import { getProjects } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects & Experience",
  description:
    "ADALIA OIL AND GAS LTD projects and company experience across divisions. Verified project entries are listed here.",
  keywords: ["ADALIA OIL AND GAS LTD", "projects", "company experience", "oil and gas projects"]
};

export default function ProjectsPage() {
  const projects = getProjects().filter((p) => p.verified);

  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Projects &amp; Experience</h1>
        <p className="mt-3 text-gold-300">Building energy solutions across ADALIA divisions</p>
      </div>

      <section id="projects" className="section-padding bg-white">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          {projects.length === 0 ? (
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">Company Experience</p>
              <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">OUR PROJECTS</h2>
              <div className="mt-6 text-lg leading-relaxed text-slate-700">
                <p>ADALIA OIL AND GAS LTD is expanding its operational footprint and the projects page is being prepared with verified entries as they are confirmed.</p>
                <p className="mt-4 text-center">
                  <a href="/contact#consultation" className="rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-900 hover:bg-gold-400">
                    Request a Consultation
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">Company Experience</p>
                <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">OUR PROJECTS</h2>
              </div>
              <div className="mt-12 space-y-6">
                {projects.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-navy-900">{p.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {p.status} · {p.location}
                          {p.completionDate ? ` · Completed: ${p.completionDate}` : ""}
                        </p>
                        {p.client && <p className="mt-1 text-sm text-slate-500">Client: {p.client}</p>}
                        {p.partner && <p className="mt-1 text-sm text-slate-500">Partner: {p.partner}</p>}
                      </div>
                      <a href="/contact#consultation" className="rounded-md bg-gold-500 px-4 py-2 font-semibold text-navy-900 hover:bg-gold-400">
                        Enquire
                      </a>
                    </div>
                    {p.description && <p className="mt-4 text-slate-700">{p.description}</p>}
                    {p.images.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {p.images.slice(0, 4).map((src, i) => (
                          <img key={i} src={src} alt={`${p.title} — project photograph ${i + 1}`} className="h-24 w-auto rounded-lg object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
