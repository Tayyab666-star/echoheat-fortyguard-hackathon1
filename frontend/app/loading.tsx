// frontend/app/loading.tsx
"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-mono">
          Loading EchoHeat...
        </p>
      </div>
    </div>
  );
}
