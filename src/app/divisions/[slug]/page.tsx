import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { divisions } from "@/data/company";
import { loadSettings } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return divisions.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = divisions.find((x) => x.slug === slug);
  if (!d) return { title: "Division" };
  return { title: d.title, description: d.short };
}

export default async function DivisionPage({ params }: Props) {
  const { slug } = await params;
  const division = divisions.find((d) => d.slug === slug);
  if (!division) notFound();

  const settings = loadSettings();
  const servicesToShow = settings.services.filter((s) => s.division === slug);

  return (
    <div>
      <div className="relative h-[320px] md:h-[420px]">        <Image src={division.image} alt={division.title} fill unoptimized className="object-cover" priority />
        <div className="absolute inset-0 bg-navy-900/70" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 text-white md:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-400">Our Division</p>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">{division.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-white/85">{division.short}</p>
        </div>
      </div>
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <h2 className="text-2xl font-bold text-navy-900">Services</h2>
          <div className="mt-4 h-1 w-20 bg-gold-500" />
          {servicesToShow.length === 0 && (
            <p className="mt-6 text-slate-600">The services of this division are being verified and will be published when confirmed.</p>
          )}
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {servicesToShow.map((service) => (
              <li key={service.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-slate-800">{service.title}</p>
                    {service.description && <p className="mt-1 text-xs text-slate-600">{service.description}</p>}
                    {service.objectives.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-slate-500">
                        {service.objectives.map((o, i) => (
                          <li key={i}>
                            <span className="text-gold-500">•</span> {o}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Link href="/contact#consultation" className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-400">
                    Enquire
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/contact#consultation" className="rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-900 hover:bg-gold-400">
              Request a Consultation
            </Link>
            <Link href="/services" className="rounded-md border border-navy-900 px-6 py-3 font-semibold text-navy-900 hover:bg-navy-900 hover:text-white">
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
