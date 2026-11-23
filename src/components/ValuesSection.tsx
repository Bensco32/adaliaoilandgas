import { loadSettings } from "@/lib/settings";

export function ValuesSection() {
  const company = loadSettings().company;
  return (
    <section className="section-padding bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">What Guides Us</p>
        <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">OUR CORE VALUES</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {company.coreValues.map((v, i) => (
            <div key={v} className="rounded-full border border-gold-500/30 bg-white px-6 py-3 text-lg font-semibold text-navy-900 shadow-sm">
              <span className="text-gold-600">◆</span> {v}
            </div>
          ))}
        </div>
        {company.foundation && <p className="mt-10 text-xl font-medium italic text-navy-800">"{company.foundation}"</p>}
      </div>
    </section>
  );
}
