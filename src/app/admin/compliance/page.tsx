import { loadSettings } from "@/lib/settings";
import { CertificatesEditor } from "@/components/admin/CertificatesEditor";

export default function AdminCompliancePage() {
  const certificates = loadSettings().compliance;
  return <CertificatesEditor certificates={certificates} />;
}
