"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoadingScreen } from "@/components/auth/LoadingScreen"

function LoadingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = (searchParams.get("type") as "initial" | "login" | "signup") || "initial"

  const handleComplete = React.useCallback(() => {
    router.replace("/dashboard")
  }, [router])

  return <LoadingScreen type={type} onComplete={handleComplete} />
}

export default function LoadingPage() {
  return (
    <React.Suspense fallback={null}>
      <LoadingContent />
    </React.Suspense>
  )
}
