"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CompanyProfile } from "@/lib/settings";

function ManagementCard({ member }: { member: CompanyProfile["management"][number] }) {
  return (
    <div className="rounded-xl border border-gold-500/20 bg-slate-50 p-5 shadow-sm">
      <p className="font-semibold text-navy-900">{member.name}</p>
      <p className="mt-1 text-sm text-gold-600">{member.title}</p>
      {member.bio && <p className="mt-2 text-sm text-slate-700">{member.bio}</p>}
      {member.linkedin && (
        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-gold-600 hover:underline">
          LinkedIn
        </a>
      )}
    </div>
  );
}

export function AboutBody({ company: data, compact = false }: { company: CompanyProfile; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const paragraphs =
    compact && expanded ? [data.about, data.about2, ...data.aboutLong] : [data.about, data.about2];

  const visionMission = (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-gold-500/20 bg-slate-50 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-navy-900">OUR VISION</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{data.vision}</p>
      </div>
      <div className="rounded-xl border border-gold-500/20 bg-slate-50 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-navy-900">OUR MISSION</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{data.mission}</p>
      </div>
    </div>
  );

  const management = (
    <div className="mt-10">
      <h3 className="text-xl font-semibold text-navy-900">MANAGEMENT &amp; LEADERSHIP</h3>
      <div className="mt-4">
        {data.management.filter((m) => m.verified).length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.management.filter((m) => m.verified).map((member) => (
              <ManagementCard key={member.name} member={member} />
            ))}
          </div>
        ) : (
          <p className="text-slate-600">Management and leadership details are pending verification and will be published when confirmed by the company.</p>
        )}
      </div>
    </div>
  );

  const objectives = data.objectives.length > 0 && (
    <div className="mt-10">
      <h3 className="text-xl font-semibold text-navy-900">CORPORATE OBJECTIVES</h3>
      <ul className="mt-4 space-y-3">
        {data.objectives.map((objective, i) => (
          <li key={i} className="flex gap-3 text-slate-700">
            <span className="text-gold-500">—</span>
            <span>{objective}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const image = (
    <div className="relative">
      <div className="relative h-[420px] overflow-hidden rounded-2xl shadow-premium">
        <Image src="/images/Reportage photography documenting energy industry.jpg" alt="Adalia industrial energy operations" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
      </div>
      <div className="absolute -bottom-4 -left-4 hidden h-24 w-24 rounded-lg border-4 border-gold-500 md:block" />
    </div>
  );

  if (compact) {
    return (
      <section id="about" className="section-padding bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">About Us</p>
            <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">ABOUT ADALIA OIL AND GAS LTD</h2>
            <div className="mt-4 h-1 w-20 bg-gold-500" />
            <div className="mt-8">
              <div className="float-none mb-6 w-full md:float-right md:ml-8 md:mb-4 md:w-1/2">
                {image}
              </div>
              <div className="text-justify">
                {paragraphs.map((text, i) => (
                  <p key={i} className={`${i === 0 ? "mt-0" : "mt-4"} text-lg leading-relaxed text-slate-700`}>
                    {text}
                  </p>
                ))}
              </div>
              <div className="clear-both" />
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className="mt-4 font-semibold text-gold-600 hover:text-gold-500"
              >
                {expanded ? "Read less" : "Read more"}
              </button>
              {visionMission}
              {management}
              {objectives}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="section-padding bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">About Us</p>
          <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">ABOUT ADALIA OIL AND GAS LTD</h2>
          <div className="mt-4 h-1 w-20 bg-gold-500" />
          <div className="mt-6 text-lg leading-relaxed text-slate-700">
            {paragraphs[0]}
          </div>
          {visionMission}
          {management}
          {objectives}
          <Link href="/about" className="mt-6 inline-block font-semibold text-gold-600 hover:text-gold-500">
            Read more
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative">
          {image}
        </motion.div>
      </div>
    </section>
  );
}
