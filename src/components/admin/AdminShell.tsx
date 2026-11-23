"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, PanelLeft, PanelRight, LogOut, Settings } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: PanelLeft },
  { href: "/admin/company", label: "Company Profile", icon: Settings },
  { href: "/admin/services", label: "Services", icon: PanelRight },
  { href: "/admin/projects", label: "Projects", icon: PanelRight },
  { href: "/admin/compliance", label: "Compliance", icon: PanelRight },
  { href: "/admin/hse", label: "HSE Policies", icon: PanelRight },
  { href: "/admin/governance", label: "Governance", icon: PanelRight },
  { href: "/admin/suppliers", label: "Suppliers", icon: PanelRight },
  { href: "/admin/enquiries", label: "Enquiries", icon: PanelRight },
  { href: "/admin/knowledge", label: "Knowledge Base", icon: PanelRight }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" })
    });
    setOpen(false);
    router.push("/admin/login");
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/admin" className="flex items-center gap-2 text-navy-900">
            <span className="text-lg font-bold text-gold-600">ADALIA OIL AND GAS LTD</span>
            <span className="text-xs font-medium text-slate-500">Admin Console</span>
          </Link>
          <button className="lg:hidden text-slate-600" onClick={() => setOpen(!open)} aria-label="Toggle admin menu">
            {open ? <PanelRight /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white px-4 py-6 ${open ? "block" : "hidden"} lg:block`}>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${active ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-gold-400" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 border-t border-slate-200 pt-4">
            <button onClick={logout} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" aria-label="Log out">
              <LogOut className="h-4 w-4 text-slate-400" />
              Log Out
            </button>
          </div>
        </aside>
        <main className="ml-0 min-h-[calc(100vh-4rem)] w-full md:ml-64">{children}</main>
      </div>
    </div>
  );
}
