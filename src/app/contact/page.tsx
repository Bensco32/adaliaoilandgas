import type { Metadata } from "next";
import { ContactSection } from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Adalia Oil and Gas Ltd for energy solutions, strategic partnerships, procurement support and business enquiries."
};

export default function ContactPage() {
  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="mt-3 text-gold-300">We are ready to hear from you</p>
      </div>
      <ContactSection />
    </div>
  );
}

export const dynamic = "force-dynamic";
