"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Leaf, Award, AlertTriangle, HardHat } from "lucide-react";
import type { CompanyProfile } from "@/lib/settings";

const points = [
  { icon: Shield, label: "Safety First." },
  { icon: Leaf, label: "Environmental Responsibility." },
  { icon: Award, label: "Operational Excellence." },
  { icon: AlertTriangle, label: "Risk Management." },
  { icon: HardHat, label: "Personnel Protection." }
];

export function HSEContent({ company }: { company: CompanyProfile }) {
  return (
    <section id="hse" className="section-padding bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative order-2 lg:order-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative h-48 overflow-hidden rounded-xl md:h-64">
              <Image src="/images/Nice to have y'all around today.jpg" alt="Oilfield workers wearing PPE and safety gear" fill unoptimized className="object-cover" />
            </div>
            <div className="relative mt-6 h-48 overflow-hidden rounded-xl md:h-64">
              <Image src="/images/more men at work.jpg" alt="Engineers inspecting valves in protective equipment at a tank farm" fill unoptimized className="object-cover" />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="order-1 lg:order-2">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">HSE Commitment</p>
          <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">OUR COMMITMENT TO HEALTH, SAFETY AND ENVIRONMENT.</h2>
          <div className="mt-4 h-1 w-20 bg-gold-500" />
          <p className="mt-6 text-lg leading-relaxed text-slate-700">{company.hse}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {points.map((p) => (
              <div key={p.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p.icon className="h-5 w-5 text-gold-600" />
                <span className="font-medium text-navy-900">{p.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
