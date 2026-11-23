import { loadSettings, type CompanyProfile } from "@/lib/settings";
import { AboutBody } from "@/components/AboutBody";

export function AboutSection({ compact = false }: { compact?: boolean }) {
  const company: CompanyProfile = loadSettings().company;
  return <AboutBody company={company} compact={compact} />;
}
