"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [retryAfterMs, setRetryAfterMs] = useState(0);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setRetryAfterMs(0);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed.");
        if (data.retryAfterMs) setRetryAfterMs(data.retryAfterMs * 1000);
        return;
      }
      window.location.assign(next);
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-navy-900">Adalia Admin Console</h1>
        <p className="mt-2 text-slate-600">Sign in to manage the Adalia Oil and Gas Ltd website.</p>
        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
            {retryAfterMs > 0 && ` Retry after ${Math.ceil(retryAfterMs / 1000)}s.`}
          </p>
        )}
        <label className="mt-4 block text-sm font-medium text-slate-700">Username</label>
        <input
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
        />
        <label className="mt-4 block text-sm font-medium text-slate-700">Password</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-sm text-slate-500" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button type="submit" disabled={busy} className="mt-6 w-full rounded-md bg-gold-500 px-4 py-3 font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60">
          {busy ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
