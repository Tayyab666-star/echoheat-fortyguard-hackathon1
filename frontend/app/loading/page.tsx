"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingScreen } from "@/components/auth/LoadingScreen";

// Prevents Next.js 15 from attempting static prerendering on useSearchParams()
export const dynamic = "force-dynamic";

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "initial" | "login" | "signup") || "initial";

  const handleComplete = React.useCallback(() => {
    router.replace("/dashboard");
  }, [router]);

  return <LoadingScreen type={type} onComplete={handleComplete} />;
}

export default function LoadingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <LoadingContent />
    </React.Suspense>
  );
}
