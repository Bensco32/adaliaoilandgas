import type { Metadata } from "next";
import { HSESection } from "@/components/HSESection";
import { HsePoliciesList } from "@/components/HsePoliciesList";

export const metadata: Metadata = {
  title: "Health, Safety and Environment (HSE)",
  description:
    "Adalia Oil and Gas Ltd Health, Safety and Environment policy, safety procedures, risk management, incident reporting, emergency response and downloadable HSE policies.",
  keywords: ["Adalia Oil and Gas Ltd", "HSE", "Health Safety Environment", "safety policy", "risk management"]
};

export default function HSEPage() {
  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Health, Safety and Environment</h1>
        <p className="mt-3 text-gold-300">Safety is our first priority</p>
      </div>
      <HSESection />
      <section id="hse-policies" className="section-padding bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">HSE Policies</p>
            <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">HSE POLICIES &amp; PROCEDURES</h2>
            <div className="mt-4 h-1 w-20 bg-gold-500" />
            <p className="mt-4 text-slate-600">Verified and published HSE policies, with downloadable documents where available.</p>
          </div>
          <div className="mt-8">
            <HsePoliciesList />
          </div>
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";
