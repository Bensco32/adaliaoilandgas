/**
 * Pure session constants shared by the middleware (compiled in the middleware
 * runtime) and the server-side auth helpers (compiled with Node).
 */
export const ADMIN_COOKIE = "adalia_admin_session";

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD_HASH?.trim());
}
