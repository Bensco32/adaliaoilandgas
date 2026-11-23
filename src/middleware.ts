/**
 * Pure middleware for the admin area (no Node imports — this module is
 * compiled with the middleware runtime).
 *
 * - `/admin` and `/api/admin/*` require an admin session cookie (presence is
 *   checked here; full session validation happens server-side via
 *   `requireSession` in the admin layout and API routes).
 * - Page routes redirect to `/admin/login` when unauthenticated.
 * - API routes return 401 JSON when unauthenticated.
 * - `/api/admin/auth` is public for login.
 * - Mutating requests to protected routes must carry an Origin header matching
 *   this host (see `checkOrigin` in `src/lib/csrf.ts`).
 */
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminConfigured } from "@/lib/sessionConstants";
import { checkOrigin } from "@/lib/csrf";

const ADMIN_PATH = "/admin";
const ADMIN_API_PATH = "/api/admin";
const AUTH_PATH = "/api/admin/auth";

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isAdminPage = pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
  const isAdminApi = pathname === ADMIN_API_PATH || pathname.startsWith(`${ADMIN_API_PATH}/`);

  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  if (pathname === AUTH_PATH) return NextResponse.next();

  const jar = await cookies();
  const authed = isAdminConfigured() && Boolean(jar.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Please log in to access the admin area." }, { status: 401 });
    }
    if (pathname === `${ADMIN_PATH}/login`) {
      // The login page itself is public.
      return NextResponse.next();
    }
    const next = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/admin/login?next=${next}`, req.url));
  }

  if (!checkOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  return NextResponse.next();
}
