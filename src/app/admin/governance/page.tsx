import { loadSettings } from "@/lib/settings";
import { DocsEditor } from "@/components/admin/DocsEditor";

export default function AdminGovernancePage() {
  const governanceDocs = loadSettings().governanceDocs;
  return <DocsEditor section="governanceDocs" docs={governanceDocs} />;
}
