"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_COOKIE = "adalia_cookie_consent";
const CONSENT_MODES = ["essential", "all"] as const;

type ConsentMode = (typeof CONSENT_MODES)[number];

function readConsent(): ConsentMode | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.split("=")[1];
  return value === "essential" || value === "all" ? value : null;
}

function writeConsent(value: ConsentMode) {
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export function CookieConsent() {
  const [mode, setMode] = useState<ConsentMode | "ask" | "custom">("ask");
  const [customOn, setCustomOn] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setMode(stored || "ask");
  }, []);

  if (mode !== "ask" && mode !== "custom") return null;

  const acceptAll = () => {
    setMode("all");
    writeConsent("all");
  };

  const confirmCustom = () => {
    setMode(customOn ? "all" : "essential");
    writeConsent(customOn ? "all" : "essential");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur md:max-w-xl md:left-1/2 md:-translate-x-1/2" data-testid="cookie-consent">
      <div className="mx-auto flex max-w-3xl flex-col-reverse items-center justify-between gap-4 md:flex-row">
        <div className="max-w-2xl text-sm text-slate-700">
          <p>
            We use essential cookies and the Adalia Oil and Gas Ltd admin session cookie. We do not use third-party tracking cookies or analytics.{" "}
            <Link href="/cookie-policy" className="font-semibold text-gold-600 hover:underline">
              Learn more in our Cookie Policy
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={acceptAll} className="rounded-md bg-gold-500 px-5 py-2 font-semibold text-navy-900 hover:bg-gold-400">
            Accept All
          </button>
          <button type="button" onClick={() => setMode("custom")} className="rounded-md border border-slate-300 px-5 py-2 font-semibold text-slate-700 hover:bg-slate-50">
            Manage Preferences
          </button>
        </div>
      </div>

      {mode === "custom" && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={customOn} onChange={(e) => setCustomOn(e.target.checked)} />
            Enable analytics and tracking (optional)
          </label>
          <button type="button" onClick={confirmCustom} className="rounded-md bg-navy-900 px-4 py-2 font-semibold text-white hover:bg-navy-800">
            Confirm Selection
          </button>
        </div>
      )}
    </div>
  );
}
