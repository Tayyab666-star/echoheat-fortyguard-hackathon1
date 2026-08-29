"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Flame, Mail, ArrowLeft, Loader2, Check } from "lucide-react"

function VerifyEmailSentContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [resending, setResending] = React.useState(false)
  const [resent, setResent] = React.useState(false)

  async function handleResend() {
    if (!email || resent) return

    setResending(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      await fetch(`${backendUrl}/api/v1/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setResent(true)
    } catch {
      // Silently fail - we don't want to reveal if email exists
    } finally {
      setResending(false)
    }
  }

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
          {/* Icon */}
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-accent/15">
            <Mail className="size-8 text-accent" />
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-center text-2xl font-bold text-text-primary">
            Check your email!
          </h1>
          <p className="mb-8 text-center text-sm text-text-muted">
            We sent a verification link to{" "}
            {email ? (
              <span className="font-medium text-text-primary">{email}</span>
            ) : (
              "your email address"
            )}
            . Click it to activate your account.
          </p>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resending || resent}
            className="
              mb-4 flex w-full items-center justify-center gap-2 rounded-xl
              border border-border bg-surface-2 px-4 py-3 text-sm font-medium text-text-primary
              transition-colors hover:bg-surface-3
              disabled:pointer-events-none disabled:opacity-60
            "
          >
            {resent ? (
              <>
                <Check className="size-4 text-success" />
                Verification email resent!
              </>
            ) : resending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend verification email"
            )}
          </button>

          {/* Wrong email link */}
          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
            >
              <ArrowLeft className="size-4" />
              Wrong email? Go back
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-text-muted">
          Already verified?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in →
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailSentPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailSentContent />
    </React.Suspense>
  )
}
