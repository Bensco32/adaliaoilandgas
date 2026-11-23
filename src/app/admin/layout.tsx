import { cookies } from "next/headers";
import { requireSessionFromJar } from "@/lib/adminAuth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const session = requireSessionFromJar(jar);
  if (!session) {
    // Middleware redirects unauthenticated admin pages to /admin/login; the
    // login page itself renders raw to avoid a redirect loop.
    return <div className="min-h-screen">{children}</div>;
  }
  return (
    <AdminShell>
      <div className="p-4 md:p-8">{children}</div>
    </AdminShell>
  );
}
