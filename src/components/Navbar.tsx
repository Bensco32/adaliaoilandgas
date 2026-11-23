"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { divisions } from "@/data/company";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [divOpen, setDivOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-navy-900 shadow-lg backdrop-blur" : "bg-navy-900"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/Company Logo.png" alt="ADALIA OIL AND GAS LTD logo" width={44} height={44} unoptimized className="object-contain" />
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide text-white md:text-base">ADALIA OIL AND GAS LTD</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold-500">Driven by Excellence</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/" className="text-sm font-medium text-white/90 hover:text-gold-400">Home</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-white/90 hover:text-gold-400" aria-haspopup="true">
              About Us <ChevronDown className="h-4 w-4" />
            </button>
            <div className="invisible absolute left-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-navy-900 p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
              <Link href="/about" className="block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-gold-400">About Us</Link>
              <Link href="/projects" className="block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-gold-400">Projects</Link>
              <Link href="/contact" className="block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-gold-400">Contact Us</Link>
              <Link href="/governance" className="block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-gold-400">Governance</Link>
            </div>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-white/90 hover:text-gold-400" aria-haspopup="true">
              Our Divisions <ChevronDown className="h-4 w-4" />
            </button>
            <div className="invisible absolute left-0 top-full mt-2 w-80 rounded-lg border border-white/10 bg-navy-900 p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
              {divisions.map((d) => (
                <Link key={d.slug} href={`/divisions/${d.slug}`} className="block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-gold-400">
                  {d.title.replace("ADALIA ", "")}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/services" className="text-sm font-medium text-white/90 hover:text-gold-400">Services</Link>
          <Link href="/hse" className="text-sm font-medium text-white/90 hover:text-gold-400">HSE</Link>
          <Link href="/compliance" className="text-sm font-medium text-white/90 hover:text-gold-400">Compliance</Link>
          <Link href="/suppliers" className="text-sm font-medium text-white/90 hover:text-gold-400">Suppliers</Link>
          <Link href="/contact#consultation" className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-400">
            Request a Consultation
          </Link>
        </nav>

        <button className="text-white lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy-900 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/" onClick={() => setOpen(false)} className="text-white/90">Home</Link>
            <button className="flex items-center justify-between text-white/90" onClick={() => setAboutOpen(!aboutOpen)}>
              About Us <ChevronDown className={`h-4 w-4 transition ${aboutOpen ? "rotate-180" : ""}`} />
            </button>
            {aboutOpen && (
              <div className="ml-3 flex flex-col gap-2 border-l border-gold-500/30 pl-3">
                <Link href="/about" onClick={() => setOpen(false)} className="text-sm text-white/80">About Us</Link>
                <Link href="/projects" onClick={() => setOpen(false)} className="text-sm text-white/80">Projects</Link>
                <Link href="/contact" onClick={() => setOpen(false)} className="text-sm text-white/80">Contact Us</Link>
                <Link href="/governance" onClick={() => setOpen(false)} className="text-sm text-white/80">Governance</Link>
              </div>
            )}
            <button className="flex items-center justify-between text-white/90" onClick={() => setDivOpen(!divOpen)}>
              Our Divisions <ChevronDown className={`h-4 w-4 transition ${divOpen ? "rotate-180" : ""}`} />
            </button>
            {divOpen && (
              <div className="ml-3 flex flex-col gap-2 border-l border-gold-500/30 pl-3">
                {divisions.map((d) => (
                  <Link key={d.slug} href={`/divisions/${d.slug}`} onClick={() => setOpen(false)} className="text-sm text-white/80">
                    {d.title.replace("ADALIA ", "")}
                  </Link>
                ))}
              </div>
            )}
            <Link href="/services" onClick={() => setOpen(false)} className="text-white/90">Services</Link>
            <Link href="/hse" onClick={() => setOpen(false)} className="text-white/90">HSE</Link>
            <Link href="/compliance" onClick={() => setOpen(false)} className="text-white/90">Compliance</Link>
            <Link href="/suppliers" onClick={() => setOpen(false)} className="text-white/90">Suppliers</Link>
            <Link href="/contact#consultation" onClick={() => setOpen(false)} className="mt-2 rounded-md bg-gold-500 px-4 py-2 text-center font-semibold text-navy-900">
              Request a Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
