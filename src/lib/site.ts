export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://www.adaliaoilandgasltd.com";

export function siteUrl(path = ""): string {
  return `${SITE_URL.replace(/\/+$/, "")}${path.startsWith("/") ? path : path ? `/${path}` : ""}`;
}

export function publicSiteUrl(path = ""): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL?.trim() || siteUrl()}${path.startsWith("/") ? path : path ? `/${path}` : ""}`;
}
