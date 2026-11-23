import { divisions } from "@/data/company";
import { loadSettings } from "@/lib/settings";
import { DivisionsGrid, type DivisionCard } from "@/components/DivisionsGrid";

export function DivisionsSection() {
  const settings = loadSettings();
  const cards: DivisionCard[] = divisions.map((d) => ({
    ...d,
    services: settings.services.filter((s) => s.division === d.slug).map((s) => s.title)
  }));
  return <DivisionsGrid cards={cards} />;
}
