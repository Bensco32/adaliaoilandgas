"use client";

import { useRouter } from "next/navigation";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-4 text-center text-white">
        <h1 className="text-5xl font-bold text-gold-400">500</h1>
        <p className="mt-4 text-xl">Something went wrong on our end</p>
        <div className="mt-6 flex gap-3">
          <button onClick={reset} className="rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-900 hover:bg-gold-400">
            Try Again
          </button>
          <button onClick={() => router.push("/")} className="rounded-md bg-navy-800 px-6 py-3 font-semibold text-white hover:bg-navy-700">
            Return Home
          </button>
        </div>
      </body>
    </html>
  );
}
