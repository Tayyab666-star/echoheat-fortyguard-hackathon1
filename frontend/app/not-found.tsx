// frontend/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
      <h1 className="text-6xl font-bold font-mono text-orange-500">404</h1>
      <h2 className="mt-4 text-xl font-semibold">Asset Not Found</h2>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        The requested microclimate route or asset telemetry view does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-orange-500 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
