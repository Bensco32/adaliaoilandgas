import { loadSettings } from "@/lib/settings";
import { SuppliersEditor } from "@/components/admin/SuppliersEditor";

export default function AdminSuppliersPage() {
  const registrations = loadSettings().supplierRegistrations;
  return <SuppliersEditor registrations={registrations} />;
}
