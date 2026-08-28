"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Flame, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, Check } from "lucide-react"

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
]

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const passwordsMatch = password === confirmPassword
  const allRulesPass = PASSWORD_RULES.every((r) => r.test(password))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allRulesPass || !passwordsMatch) return

    setLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const res = await fetch(`${backendUrl}/api/v1/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to reset password. The link may have expired.")
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
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

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent-success/15">
              <CheckCircle2 className="size-6 text-accent-success" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Password reset!</h1>
            <p className="mt-2 text-sm text-text-muted">
              Your password has been updated successfully.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
            >
              Sign in with new password &rarr;
            </button>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary">Reset password</h1>
              <p className="mt-1 text-sm text-text-muted">
                Enter your new password below.
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
              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-text-primary">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                      w-full rounded-xl border border-border-default bg-surface-1
                      px-4 py-3 pr-11 text-sm text-text-primary placeholder:text-text-muted
                      outline-none transition-colors
                      focus:border-accent focus:ring-2 focus:ring-accent/20
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-1 flex flex-col gap-1">
                    {PASSWORD_RULES.map((rule) => (
                      <div key={rule.label} className="flex items-center gap-1.5">
                        <Check
                          className={`size-3 ${rule.test(password) ? "text-accent-success" : "text-text-muted"}`}
                        />
                        <span className={`text-[11px] ${rule.test(password) ? "text-accent-success" : "text-text-muted"}`}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-text-primary">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`
                    rounded-xl border bg-surface-1
                    px-4 py-3 text-sm text-text-primary placeholder:text-text-muted
                    outline-none transition-colors
                    focus:ring-2
                    ${confirmPassword && !passwordsMatch
                      ? "border-accent-danger/40 focus:border-accent-danger focus:ring-accent-danger/20"
                      : "border-border-default focus:border-accent focus:ring-accent/20"
                    }
                  `}
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-[11px] text-accent-danger">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !allRulesPass || !passwordsMatch}
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
                    Resetting...
                  </>
                ) : (
                  "Reset password"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-text-muted">
              <Link href="/login" className="font-medium text-accent hover:underline">
                &larr; Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
