"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Flame, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

function computeStrength(password: string): number {
  if (password.length === 0) return 0
  if (password.length < 8) return 1
  if (!/[0-9]/.test(password)) return 2
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) return 3
  return 4
}

const STRENGTH_COLORS: Record<number, string> = {
  0: "bg-surface-3",
  1: "bg-danger",
  2: "bg-warning",
  3: "bg-info",
  4: "bg-success",
}

const STRENGTH_LABELS: Record<number, string> = {
  0: "",
  1: "Too short — needs 8+ characters",
  2: "Weak — add a number",
  3: "Good — add a symbol for maximum security",
  4: "Strong ✓",
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const { signIn, isLoaded } = useSignIn()

  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [confirmTouched, setConfirmTouched] = React.useState(false)

  const strength = computeStrength(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const email = sessionStorage.getItem("echoheat_reset_email")
      if (!email) router.replace("/forgot-password")
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (strength < 1 || !passwordsMatch || !isLoaded) return

    setLoading(true)
    setError(null)

    try {
      const result = await signIn.resetPassword({ password })

      if (result.status === "complete") {
        sessionStorage.removeItem("echoheat_reset_token")
        sessionStorage.removeItem("echoheat_reset_email")
        setSuccess(true)
        setLoading(false)

        setTimeout(() => router.push("/login"), 2000)
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ||
            "Failed to reset password."
      setError(message)
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
            <h1 className="text-2xl font-bold text-text-primary">Password updated!</h1>
            <p className="mt-2 text-sm text-text-muted">
              Redirecting to sign in...
            </p>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary">Create a new password</h1>
              <p className="mt-1 text-sm text-text-muted">
                Enter a strong password for your account.
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
              {/* New Password */}
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

                {/* Strength indicator */}
                {password.length > 0 && (
                  <div className="mt-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            strength > i ? STRENGTH_COLORS[strength] : "bg-surface-3"
                          }`}
                        />
                      ))}
                    </div>
                    {STRENGTH_LABELS[strength] && (
                      <p className={`mt-1 text-[11px] ${strength === 4 ? "text-success" : "text-text-muted"}`}>
                        {STRENGTH_LABELS[strength]}
                      </p>
                    )}
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
                  onBlur={() => setConfirmTouched(true)}
                  className={`
                    rounded-xl border bg-surface-1
                    px-4 py-3 text-sm text-text-primary placeholder:text-text-muted
                    outline-none transition-colors
                    focus:ring-2
                    ${confirmTouched && confirmPassword && !passwordsMatch
                      ? "border-accent-danger/40 focus:border-accent-danger focus:ring-accent-danger/20"
                      : "border-border-default focus:border-accent focus:ring-accent/20"
                    }
                  `}
                />
                {confirmTouched && confirmPassword && !passwordsMatch && (
                  <p className="text-[11px] text-accent-danger">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || strength < 1 || !passwordsMatch}
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
                    Updating...
                  </>
                ) : (
                  "Update Password"
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
