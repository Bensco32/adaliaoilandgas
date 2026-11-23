/**
 * Admin authentication API.
 * - GET: returns current admin identity.
 * - POST: login. Throttled per IP (5 attempts / 10 min). Passwords are
 *   verified with scrypt + timing-safe comparison; sessions are rotated
 *   (old sessions invalidated on re-login).
 * - POST /logout: invalidates the session and clears the cookie.
 */
import { NextResponse } from "next/server";
import {
  createSession,
  destroySession,
  getAdminUsername,
  getSession,
  getSessionFromRequest,
  requireSession,
  setSessionCookie,
  verifyPassword
} from "@/lib/adminAuth";
import { ADMIN_COOKIE, isAdminConfigured } from "@/lib/sessionConstants";
import { checkOrigin } from "@/lib/csrf";
import { isRateLimited, resetRateLimit, clientIp } from "@/lib/rateLimiter";
import { logActivity } from "@/lib/settings";

const BODY_LIMIT = 4096;

function denyUnauth(): NextResponse {
  return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
}

export async function GET(req: Request) {
  const session = requireSession(req);
  if (!session) return denyUnauth();
  return NextResponse.json({ admin: true, username: session.user });
}

export async function POST(req: Request) {
  if (!checkOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin is not configured." }, { status: 503 });
  }

  const ip = clientIp(req);
  const bodyText = (await req.text().catch(() => "")) || "";
  if (bodyText.length > BODY_LIMIT) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rate = isRateLimited(`admin-login:${ip}`, 5, 10 * 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later.", retryAfterMs: Math.ceil(rate.retryAfterMs / 1000) }, { status: 429 });
  }

  let body: { username?: unknown; password?: unknown; action?: unknown } = {};
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.action === "logout") {
    const sessionId = getSessionFromRequest(req) || "";
    if (sessionId) destroySession(sessionId);
    resetRateLimit(`admin-login:${ip}`);
    const res = NextResponse.json({ success: true });
    res.cookies.delete(ADMIN_COOKIE);
    return res;
  }

  const username = typeof body.username === "string" ? body.username.trim().slice(0, 100) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 512) : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Please provide a username and password." }, { status: 400 });
  }

  const storedHash = process.env.ADMIN_PASSWORD_HASH?.trim() || "";
  const valid = verifyPassword(password, storedHash);
  const nameMatches = username === getAdminUsername();

  if (!valid || !nameMatches) {
    // Keep failure semantics uniform so a valid username doesn't leak information.
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  // Rotate the session id so re-login invalidates the previous session.
  const sessionId = createSession();
  resetRateLimit(`admin-login:${ip}`);
  logActivity("admin_login", "Administrator logged in.");
  const res = NextResponse.json({ success: true, username: getAdminUsername() });
  setSessionCookie(res, sessionId.id, sessionId.expiresAt - Date.now());
  return res;
}
