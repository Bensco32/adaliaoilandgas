import { loadSettings } from "@/lib/settings";
import { DocsEditor } from "@/components/admin/DocsEditor";

export default function AdminHSEPage() {
  const hsePolicies = loadSettings().hsePolicies;
  return <DocsEditor section="hsePolicies" docs={hsePolicies} />;
}
