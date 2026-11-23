import { loadSettings } from "@/lib/settings";
import { HSEContent } from "@/components/HSEContent";

export function HSESection() {
  const company = loadSettings().company;
  return <HSEContent company={company} />;
}
