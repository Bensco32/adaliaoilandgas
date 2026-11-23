import type { Metadata } from "next";
import { FAQSection } from "@/components/FAQSection";
import { faqs } from "@/data/company";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about Adalia Oil and Gas Ltd, our divisions, services and how to contact us.",
  keywords: ["ADALIA OIL AND GAS LTD", "FAQ", "questions", "services", "divisions"]
};

export default function FAQPage() {
  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">FAQ</h1>
        <p className="mt-3 text-gold-300">Answers about Adalia Oil and Gas Ltd and our services</p>
      </div>
      <FAQSection />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntityOfPage: {
              "@type": "WebPage",
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://www.adaliaoilandgasltd.com"}/faq`
            },
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a }
            }))
          }).replace(/</g, "\\u003C")
        }}
      />
    </div>
  );
}
