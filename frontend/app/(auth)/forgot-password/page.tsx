"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Flame, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const res = await fetch(`${backendUrl}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      await res.json()

      sessionStorage.setItem("echoheat_reset_email", email)
      setSent(true)
      setLoading(false)

      setTimeout(() => router.push("/verify-otp"), 1500)
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent/15">
            <Flame className="size-5 text-accent" />
          </span>
          <span className="font-mono text-lg font-bold tracking-tight text-text-primary">
            EchoHeat
          </span>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent-success/15">
              <CheckCircle2 className="size-6 text-accent-success" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Code on its way</h1>
            <p className="mt-2 text-sm text-text-muted">
              If that email exists, a 6-digit code is on its way.
            </p>
            <p className="mt-1 text-xs text-text-muted">Redirecting to verification...</p>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary">Forgot your password?</h1>
              <p className="mt-1 text-sm text-text-muted">
                Enter your email address and we&apos;ll send a 6-digit verification code.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 rounded-lg border border-accent-danger/40 bg-accent-danger/10 px-3 py-2.5 text-sm text-accent-danger"
              >
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-text-primary">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    rounded-xl border border-border-default bg-surface-1
                    px-4 py-3 text-sm text-text-primary placeholder:text-text-muted
                    outline-none transition-colors
                    focus:border-accent focus:ring-2 focus:ring-accent/20
                  "
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  mt-2 flex w-full items-center justify-center gap-2 rounded-xl
                  bg-accent px-4 py-3 text-sm font-semibold text-text-inverse
                  transition-colors hover:opacity-90
                  disabled:pointer-events-none disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send Code"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-text-muted">
              <Link href="/login" className="font-medium text-accent hover:underline">
                &larr; Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
