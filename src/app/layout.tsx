import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { BackToTop } from "@/components/BackToTop";
import { CookieConsent } from "@/components/CookieConsent";
import { SeoStructuredData } from "@/components/SeoStructuredData";
import { SITE_URL, siteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ADALIA OIL AND GAS LTD | Driven by Excellence. Powering Energy.",
    template: "%s | ADALIA OIL AND GAS LTD"
  },
  description:
    "Adalia Oil and Gas Ltd is a full-capacity indigenous energy group delivering drilling, crude lifting, marine and logistics, gas, and petroleum solutions across Nigeria and international markets.",
  keywords: [
    "ADALIA OIL AND GAS LTD",
    "Oil and Gas Company in Nigeria",
    "Drilling Services Nigeria",
    "Crude Oil Lifting Nigeria",
    "Marine and Logistics Services",
    "LPG and CNG Supply Nigeria",
    "Petroleum Products Supply Nigeria",
    "Compliance Nigeria",
    "HSE Nigeria",
    "Suppliers Nigeria"
  ],
  generator: "Next.js",
  alternates: { canonical: siteUrl(), languages: {} },
  openGraph: {
    title: "ADALIA OIL AND GAS LTD",
    description:
      "Driven by Excellence. Powering Energy. Integrated drilling, crude lifting, gas and petroleum solutions across Nigeria and international markets.",
    url: siteUrl(),
    siteName: "ADALIA OIL AND GAS LTD",
    type: "website",
    locale: "en_NG",
    images: [siteUrl("/images/Company Logo.png")]
  },
  twitter: {
    card: "summary_large_image",
    title: "ADALIA OIL AND GAS LTD",
    description: "Driven by Excellence. Powering Energy.",
    images: [siteUrl("/images/Company Logo.png")]
  },
  robots: { index: true, follow: true },
  referrer: "origin-when-cross-origin"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/Company Logo.png" type="image/png" />
        <meta name="apple-mobile-web-app-title" content="Adalia Oil and Gas Ltd" />
      </head>
      <body className={`${inter.className} bg-white`}>
        <SkipToContent />
        <SeoStructuredData />
        <Navbar />
        <main id="main" className="pt-16">{children}</main>
        <Footer />
        <BackToTop />
        <Chatbot />
        <CookieConsent />
      </body>
    </html>
  );
}

function SkipToContent() {
  return (
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:rounded-md focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-navy-900">
      Skip to main content
    </a>
  );
}

export const dynamic = "force-dynamic";
