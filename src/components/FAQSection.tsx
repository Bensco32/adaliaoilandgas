"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/data/company";

export function FAQSection({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = limit ? faqs.slice(0, limit) : faqs;

  return (
    <section id="faq" className="section-padding bg-white">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">Knowledge Base</p>
          <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">FAQ</h2>
        </div>
        <div className="mt-10 space-y-3">
          {items.map((faq, i) => (
            <div key={faq.q} className="rounded-xl border border-slate-200 bg-slate-50">
              <button
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-navy-900"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-gold-600 transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="border-t border-slate-200 px-5 py-4 text-slate-700 leading-relaxed">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
