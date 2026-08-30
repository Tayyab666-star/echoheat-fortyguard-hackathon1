"use client"

import { useClerk } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function SSOCallbackPage() {
  const { handleRedirectCallback } = useClerk()
  const router = useRouter()

  useEffect(() => {
    handleRedirectCallback({
      redirectUrlComplete: "/dashboard",
    }).catch(() => {
      router.push("/login")
    })
  }, [handleRedirectCallback, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin text-accent" />
        <p className="text-sm text-text-muted">Completing sign in...</p>
      </div>
    </div>
  )
}
