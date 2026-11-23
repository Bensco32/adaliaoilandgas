import type { Metadata } from "next";
import { AboutSection } from "@/components/AboutSection";
import { ValuesSection } from "@/components/ValuesSection";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Adalia Oil and Gas Ltd, our vision, mission and core values as an integrated indigenous energy group."
};

export default function AboutPage() {
  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">About Adalia Oil and Gas Ltd</h1>
        <p className="mt-3 text-gold-300">{company.slogan}</p>
      </div>
      <AboutSection compact />
      <div id="vision" className="scroll-mt-24" />
      <div id="mission" className="scroll-mt-24" />
      <div id="values"><ValuesSection /></div>
    </div>
  );
}

export const dynamic = "force-dynamic";
