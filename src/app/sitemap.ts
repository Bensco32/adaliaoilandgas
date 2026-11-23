import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages = [
    "",
    "/about",
    "/services",
    "/divisions/drilling-services",
    "/divisions/crude-lifting-marine-logistics",
    "/divisions/gas",
    "/divisions/petroleum-supply",
    "/hse",
    "/hse#hse-policies",
    "/compliance",
    "/governance",
    "/projects",
    "/suppliers",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/cookie-policy"
  ];
  return publicPages.map((r) => ({
    url: siteUrl(r),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: r === "" || r === "/services" ? 1 : 0.8
  }));
}
