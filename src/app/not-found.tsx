import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-4 text-center text-white">
      <h1 className="text-5xl font-bold text-gold-400">404</h1>
      <p className="mt-4 text-xl">Page not found</p>
      <p className="mt-2 text-white/70">The page you are looking for may have been moved or does not exist.</p>
      <Link href="/" className="mt-6 rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-900 hover:bg-gold-400">Return Home</Link>
    </div>
  );
}
