"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface DivisionCard {
  slug: string;
  title: string;
  short: string;
  image: string;
  services: string[];
}

export function DivisionsGrid({ cards }: { cards: DivisionCard[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="divisions" className="section-padding bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">Our Operations</p>
          <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">OUR FOUR BUSINESS DIVISIONS</h2>
          <p className="mt-4 text-slate-600">Integrated capabilities across the oil and gas value chain, delivered with excellence, safety and reliability.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {cards.map((d, i) => (
            <motion.article
              key={d.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200"
              onMouseEnter={() => setHovered(d.slug)}
              onMouseLeave={() => setHovered((prev) => (prev === d.slug ? null : prev))}
            >
              <div className="relative h-56">
                <Image src={d.image} alt={d.title} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent" />
                <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white">{d.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-700">{d.short}</p>
                <ul className="mt-4 space-y-1 text-sm text-slate-600">
                  {d.services.slice(0, 3).map((s) => (
                    <li key={s} className="flex gap-2"><span className="text-gold-500">•</span><span>{s}</span></li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link href={`/divisions/${d.slug}`} className="inline-flex items-center gap-1 font-semibold text-navy-900 hover:text-gold-600">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/contact#consultation" className="ml-auto rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
                    Contact Our Team
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
