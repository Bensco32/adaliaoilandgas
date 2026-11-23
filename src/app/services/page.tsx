import type { Metadata } from "next";
import Link from "next/link";
import { company, divisions } from "@/data/company";
import { loadSettings } from "@/lib/settings";
import { DivisionsGrid, type DivisionCard } from "@/components/DivisionsGrid";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore ADALIA OIL AND GAS LTD services across drilling, crude lifting, marine and logistics, gas, and petroleum supply with service objectives and operational capabilities.",
  keywords: [
    "ADALIA OIL AND GAS LTD",
    "oil and gas services",
    "drilling services Nigeria",
    "crude lifting Nigeria",
    "marine logistics",
    "LPG supply Nigeria",
    "petroleum supply Nigeria"
  ]
};

function ServiceSummaryList() {
  const settings = loadSettings();
  const verified = settings.services.filter((s) => s.verified);
  const grouped = new Map<string, string[]>();
  for (const s of verified) grouped.set(s.division, [...(grouped.get(s.division) || []), s.title]);
  const divisionBySlug = new Map(divisions.map((d) => [d.slug, d]));

  if (verified.length === 0) {
    return <p className="text-slate-600">Services are being verified and will be published when confirmed by management.</p>;
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.keys()).map((slug) => {
        const d = divisionBySlug.get(slug);
        const titles = grouped.get(slug) || [];
        return (
          <div key={slug}>
            <h3 className="text-lg font-semibold text-navy-900">{d?.title || slug}</h3>
            <ul className="mt-3 space-y-2">
              {titles.map((title) => (
                <li key={title} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="font-medium text-slate-700">{title}</span>
                  <Link href="/contact#consultation" className="rounded-md border border-gold-500 px-4 py-2 text-sm font-semibold text-gold-600 hover:bg-gold-50">
                    Enquire
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default function ServicesPage() {
  const settings = loadSettings();
  const cards: DivisionCard[] = divisions.map((d) => ({
    ...d,
    services: settings.services.filter((s) => s.division === d.slug).map((s) => s.title)
  }));

  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Our Services</h1>
        <p className="mx-auto mt-3 max-w-2xl text-white/80">Comprehensive, integrated energy solutions delivered with safety, reliability and excellence across the oil and gas value chain.</p>
      </div>
      <section className="section-padding bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl font-bold text-navy-900">All Services</h2>
          <div className="mt-4 h-1 w-20 bg-gold-500" />
          <ServiceSummaryList />
        </div>
      </section>
      <DivisionsGrid cards={cards} />
      <div className="bg-white pb-16 text-center">
        <Link href="/contact#consultation" className="rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-900 hover:bg-gold-400">
          Request a Consultation
        </Link>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
