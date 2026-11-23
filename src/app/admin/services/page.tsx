import { loadSettings } from "@/lib/settings";
import { ServicesEditor } from "@/components/admin/ServicesEditor";

export default function AdminServicesPage() {
  const services = loadSettings().services;
  return <ServicesEditor services={services} />;
}
