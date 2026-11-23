import type { MetadataRoute } from "next";
import { SITE_URL, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: "/admin" },
      { userAgent: "*", disallow: "/api" },
      { userAgent: "*", disallow: "/documents" },
      { userAgent: "*", disallow: "/data" }
    ],
    sitemap: siteUrl("/sitemap.xml")
  };
}
