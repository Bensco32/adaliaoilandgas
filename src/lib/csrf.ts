/**
 * CSRF protection helpers.
 *
 * - `checkOrigin` enforces that mutating requests carry an `Origin` header
 *   that matches this site's host (browsers always send Origin on cross-site
 *   POSTs). Requests without an Origin header (curl, some proxies) are allowed
 *   to avoid breaking headless tooling; the browser attack surface is covered.
 * - Server-side session cookies are HttpOnly + SameSite=Strict (see
 *   `adminAuth`), which is the other half of CSRF protection for API routes.
 */
export function isMutatingMethod(method: string): boolean {
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
}

export function checkOrigin(req: Request): boolean {
  if (!isMutatingMethod(req.method)) return true;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const host = req.headers.get("host") || new URL(req.url).host;
    return originUrl.host === host || originUrl.hostname === new URL(req.url).hostname;
  } catch {
    return false;
  }
}

export function requireOrigin(req: Request): boolean {
  return checkOrigin(req);
}
