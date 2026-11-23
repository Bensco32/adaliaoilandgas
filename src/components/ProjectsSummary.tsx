/**
 * Server-side summary of verified projects for the home page.
 * When there are no verified projects, shows a neutral introduction.
 */
import Link from "next/link";
import { loadSettings } from "@/lib/settings";

export function ProjectsSummary() {
  const projects = loadSettings().projects.filter((p) => p.verified);
  if (projects.length === 0) {
    return (
      <section id="projects" className="section-padding bg-slate-50">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">Company Experience</p>
          <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">OUR PROJECTS</h2>
          <div className="mt-6 text-lg leading-relaxed text-slate-700">
            <p>ADALIA OIL AND GAS LTD is expanding its operational footprint. Project entries are being added as they are verified and published — the projects page will reflect them shortly.</p>
            <p className="mt-4">
              <Link href="/contact#consultation" className="rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-900 hover:bg-gold-400">
                Request a Consultation
              </Link>
            </p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="projects" className="section-padding bg-slate-50">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">Company Experience</p>
        <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">OUR PROJECTS</h2>
        <p className="mt-4 text-slate-600">Verified projects are listed on the dedicated <Link href="/projects" className="text-gold-600 hover:underline">Projects page</Link>.</p>
      </div>
    </section>
  );
}
