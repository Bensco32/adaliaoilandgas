import { loadSettings } from "@/lib/settings";
import { EnquiriesEditor } from "@/components/admin/EnquiriesEditor";

export default function AdminEnquiriesPage() {
  const enquiries = loadSettings().enquiries;
  return <EnquiriesEditor enquiries={enquiries} />;
}
