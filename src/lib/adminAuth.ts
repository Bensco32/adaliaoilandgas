/**
 * Admin authentication.
 *
 * - Sessions are random 256-bit tokens kept in `data/admin-sessions.json`
 *   with an expiry (default 30 min, `ADALIA_ADMIN_SESSION_TTL_MS`).
 * - Passwords are stored as scrypt hashes (`ADMIN_PASSWORD_HASH`); the
 *   plaintext password is never stored or transmitted after login.
 * - The session cookie is HttpOnly, SameSite=Strict and Secure in HTTPS
 *   contexts; the raw cookie is just the session id, so session fixation or
 *   cookie theft without HTTPS is mitigated by HttpOnly + Strict.
 * - Login attempts are throttled per client IP.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ADMIN_COOKIE, isAdminConfigured } from "@/lib/sessionConstants";
import { DATA_DIR } from "@/lib/settings";

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "admin").trim() || "admin";
const SESSION_TTL_MS = Math.max(60_000, Number.parseInt(process.env.ADALIA_ADMIN_SESSION_TTL_MS || "1800000", 10) || 1_800_000);
const SESSION_FILE = path.join(DATA_DIR, "admin-sessions.json");

interface StoredSession {
  user: string;
  expiresAt: number;
}

const sessions = new Map<string, StoredSession>();
let loaded = false;

function loadSessions(): void {
  if (loaded) return;
  loaded = true;
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const raw = JSON.parse(fs.readFileSync(SESSION_FILE, "utf8")) as Record<string, StoredSession>;
      for (const [id, s] of Object.entries(raw)) {
        if (typeof s.user === "string" && typeof s.expiresAt === "number") {
          sessions.set(id, s);
        }
      }
    }
  } catch {
    sessions.clear();
  }
  pruneSessions();
}

function saveSessions(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${SESSION_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(Object.fromEntries(sessions)), "utf8");
  fs.renameSync(tmp, SESSION_FILE);
}

function pruneSessions(): void {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (s.expiresAt <= now) sessions.delete(id);
  }
}

export function getAdminUsername(): string {
  return ADMIN_USERNAME;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("base64");
  const hash = crypto.scryptSync(password, Buffer.from(salt, "base64"), 32).toString("base64");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  try {
    const salt = Buffer.from(parts[1], "base64");
    const expected = Buffer.from(parts[2], "base64");
    const actual = crypto.scryptSync(password, salt, 32);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function createSession(): { id: string; expiresAt: number } {
  loadSessions();
  const id = crypto.randomBytes(32).toString("hex");
  sessions.set(id, { user: ADMIN_USERNAME, expiresAt: Date.now() + SESSION_TTL_MS });
  pruneSessions();
  if (sessions.size > 1000) {
    // Drop the oldest sessions if the map grows unexpectedly.
    const oldest = [...sessions.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt)[0]?.[0];
    if (oldest) sessions.delete(oldest);
  }
  saveSessions();
  return { id, expiresAt: sessions.get(id)?.expiresAt ?? Date.now() + SESSION_TTL_MS };
}

export function getSession(id: string | null | undefined): StoredSession | null {
  if (!id) return null;
  loadSessions();
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(id);
    saveSessions();
    return null;
  }
  return session;
}

export function extendSession(id: string): StoredSession | null {
  const session = getSession(id);
  if (!session) return null;
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  saveSessions();
  return session;
}

export function destroySession(id: string): void {
  loadSessions();
  sessions.delete(id);
  saveSessions();
}

export function getSessionFromRequest(req: Request): string | null {
  const header = req.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(ADMIN_COOKIE + "=")) {
      const value = trimmed.slice(ADMIN_COOKIE.length + 1);
      return value || null;
    }
  }
  return null;
}

export function requireSession(req: Request): StoredSession | null {
  const id = getSessionFromRequest(req) || "";
  return id ? getSession(id) : null;
}

export function requireSessionFromJar(
  jar: { get: (name: string) => { value?: string } | undefined }
): StoredSession | null {
  const id = jar.get(ADMIN_COOKIE)?.value || "";
  return id ? getSession(id) : null;
}

export function setSessionCookie(res: { cookies: { set(name: string, value: string, options: Record<string, unknown>): void } }, id: string, ttlMs: number): void {
  res.cookies.set(ADMIN_COOKIE, id, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.ADALIA_FORCE_COOKIE_SECURE === "1" || process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.max(60, Math.floor(ttlMs / 1000))
  });
}

export function isSecureRequest(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto")?.toLowerCase();
  const url = new URL(req.url);
  return (
    url.protocol === "https:" ||
    proto === "https" ||
    process.env.ADALIA_FORCE_COOKIE_SECURE === "1" ||
    process.env.NODE_ENV === "production"
  );
}
