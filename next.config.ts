import type { NextConfig } from "next";

/**
 * Public images are frequently replaced with the same filename (for example
 * when updated brand photos are dropped into public/images). Browsers and the
 * Next.js image optimizer would otherwise keep serving the cached old file.
 * These settings make every refresh fetch the current file from disk.
 */
const noStore = [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }];

/**
 * Production security headers. Notes:
 * - CSP allows inline styles (Tailwind + Framer Motion use inline styles and
 *   Next injects styles); everything else is same-origin.
 * - `formSubmit.co` is whitelisted in connect-src because enquiry delivery
 *   uses a browser POST to that relay when SMTP is not configured.
 * - HSTS is only meaningful behind real HTTPS; most browsers ignore it on
 *   plain HTTP, so it is harmless in dev and enforced behind reverse proxies.
 */
const prod = process.env.NODE_ENV !== "development";

const csp = [
  "default-src 'self'",
  // NOTE: 'unsafe-inline' is required by Next.js App Router (inline RSC
  // payload + suspense scripts); XSS is mitigated by React escaping, input
  // sanitisation and the other directives.
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://formsubmit.co",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'self'",
  "child-src 'self'",
  "manifest-src 'self'"
].join("; ");

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    minimumCacheTTL: 0
  },
  async headers() {
    const globalHeaders = [
      { key: "x-content-type-options", value: "nosniff" },
      { key: "x-xss-protection", value: "1; mode=block" },
      { key: "x-frame-options", value: "SAMEORIGIN" },
      { key: "referrer-policy", value: "strict-origin-when-cross-origin" },
      {
        key: "permissions-policy",
        value: "camera=(), microphone=(), geolocation=(), fullscreen=(self)"
      },
      { key: "content-security-policy", value: csp }
    ];
    if (prod) {
      globalHeaders.push({
        key: "strict-transport-security",
        value: "max-age=31536000; includeSubDomains; preload"
      });
    }
    return [
      { source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/images/:path*", headers: noStore },
      { source: "/_next/image", headers: noStore },
      { source: "/:path*", headers: globalHeaders }
    ];
  }
};

export default nextConfig;
