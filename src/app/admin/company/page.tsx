import { loadSettings, type CompanyProfile } from "@/lib/settings";
import { CompanyEditor } from "@/components/admin/CompanyEditor";

export default function AdminCompanyPage() {
  const company: CompanyProfile = loadSettings().company;
  return <CompanyEditor initial={company} />;
}
