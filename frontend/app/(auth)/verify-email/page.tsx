"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Flame, CheckCircle, XCircle, Loader2 } from "lucide-react"

type VerificationStatus = "loading" | "success" | "error"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = React.useState<VerificationStatus>("loading")
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (!token) {
      setStatus("error")
      setError("No verification token provided")
      return
    }

    async function verifyEmail() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        const res = await fetch(`${backendUrl}/api/v1/auth/verify-email?token=${token}`)
        const data = await res.json()

        if (!res.ok) {
          setStatus("error")
          setError(data.message || "Verification failed")
          return
        }

        setStatus("success")
      } catch {
        setStatus("error")
        setError("Something went wrong. Please try again.")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent/15">
            <Flame className="size-5 text-accent" />
          </span>
          <span className="font-mono text-lg font-bold tracking-tight text-text-primary">
            EchoHeat
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface-1 p-8">
          {/* Loading state */}
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-accent/15">
                <Loader2 className="size-8 text-accent animate-spin" />
              </div>
              <h1 className="mb-2 text-center text-2xl font-bold text-text-primary">
                Verifying your email...
              </h1>
              <p className="text-center text-sm text-text-muted">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {/* Success state */}
          {status === "success" && (
            <div className="flex flex-col items-center">
              <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-green-500/15">
                <CheckCircle className="size-8 text-green-500" />
              </div>
              <h1 className="mb-2 text-center text-2xl font-bold text-text-primary">
                Email verified! ✓
              </h1>
              <p className="mb-8 text-center text-sm text-text-muted">
                Your account has been activated. You can now sign in.
              </p>
              <Link
                href="/login"
                className="
                  flex w-full items-center justify-center gap-2 rounded-xl
                  bg-accent px-4 py-3 text-sm font-semibold text-text-inverse
                  transition-colors hover:opacity-90
                "
              >
                Go to Login →
              </Link>
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="flex flex-col items-center">
              <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-500/15">
                <XCircle className="size-8 text-red-500" />
              </div>
              <h1 className="mb-2 text-center text-2xl font-bold text-text-primary">
                Verification failed
              </h1>
              <p className="mb-8 text-center text-sm text-text-muted">
                {error || "The verification link is invalid or has expired."}
              </p>
              <div className="flex flex-col gap-3 w-full">
                <Link
                  href="/signup"
                  className="
                    flex w-full items-center justify-center gap-2 rounded-xl
                    bg-accent px-4 py-3 text-sm font-semibold text-text-inverse
                    transition-colors hover:opacity-90
                  "
                >
                  Create a new account
                </Link>
                <Link
                  href="/login"
                  className="
                    flex w-full items-center justify-center gap-2 rounded-xl
                    border border-border bg-surface-2 px-4 py-3 text-sm font-medium text-text-primary
                    transition-colors hover:bg-surface-3
                  "
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
