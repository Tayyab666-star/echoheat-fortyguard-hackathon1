"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Flame, AlertCircle, Loader2 } from "lucide-react"

const OTP_LENGTH = 6
const RESEND_SECONDS = 90
const MAX_ATTEMPTS = 5

function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!local || !domain) return email
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local.slice(0, 2)}***@${domain}`
}

export default function VerifyOtpPage() {
  const router = useRouter()
  const email = React.useMemo(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("echoheat_reset_email") || ""
    return ""
  }, [])

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const [otp, setOtp] = React.useState<string[]>(Array(OTP_LENGTH).fill(""))
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [attempts, setAttempts] = React.useState(0)
  const [shaking, setShaking] = React.useState(false)
  const [resendTimer, setResendTimer] = React.useState(RESEND_SECONDS)
  const [resending, setResending] = React.useState(false)

  // Redirect if no email
  React.useEffect(() => {
    if (!email) router.replace("/forgot-password")
  }, [email, router])

  // Resend countdown
  React.useEffect(() => {
    if (resendTimer <= 0) return
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [resendTimer])

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const digit = value.slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    setError(null)

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all filled
    if (digit && next.every((d) => d !== "")) {
      submitOtp(next.join(""))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp]
      next[index - 1] = ""
      setOtp(next)
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    if (pasted.length === 0) return

    const next = [...otp]
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setOtp(next)

    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()

    if (pasted.length === OTP_LENGTH) {
      submitOtp(pasted)
    }
  }

  async function submitOtp(code: string) {
    if (!email || loading) return
    setLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const res = await fetch(`${backendUrl}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      })

      const data = await res.json()

      if (!res.ok) {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)

        if (newAttempts >= MAX_ATTEMPTS) {
          setError("Too many attempts. Redirecting to forgot password...")
          setTimeout(() => router.replace("/forgot-password"), 2000)
          return
        }

        setError(data.message || "Incorrect code.")
        setShaking(true)
        setTimeout(() => setShaking(false), 400)
        setOtp(Array(OTP_LENGTH).fill(""))
        inputRefs.current[0]?.focus()
        setLoading(false)
        return
      }

      sessionStorage.setItem("echoheat_reset_token", data.data?.resetToken || "")
      router.push("/reset-password")
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendTimer > 0 || resending || !email) return
    setResending(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      await fetch(`${backendUrl}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setResendTimer(RESEND_SECONDS)
      setAttempts(0)
      setOtp(Array(OTP_LENGTH).fill(""))
      setError(null)
      inputRefs.current[0]?.focus()
    } catch {
      // silent
    } finally {
      setResending(false)
    }
  }

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
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

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Enter verification code</h1>
          <p className="mt-1 text-sm text-text-muted">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-text-primary">{maskEmail(email)}</span>
          </p>
        </div>

        {/* Error */}
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

        {/* OTP Input */}
        <motion.div
          animate={shaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center gap-3 mb-6"
        >
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              disabled={loading}
              className={`
                size-12 rounded-xl border-2 bg-surface-1 text-center text-xl font-bold
                text-text-primary outline-none transition-all
                focus:border-accent focus:ring-2 focus:ring-accent/20
                disabled:opacity-50
                ${error ? "border-accent-danger" : "border-border-default"}
              `}
            />
          ))}
        </motion.div>

        {/* Resend timer */}
        <div className="text-center mb-6">
          {resendTimer > 0 ? (
            <p className="text-sm text-text-muted">
              Resend code in{" "}
              <span className="font-medium text-text-primary">{formatTimer(resendTimer)}</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-medium text-accent hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="flex justify-center mb-4">
            <Loader2 className="size-5 animate-spin text-accent" />
          </div>
        )}

        <p className="mt-4 text-center text-sm text-text-muted">
          <Link href="/forgot-password" className="font-medium text-accent hover:underline">
            &larr; Use a different email
          </Link>
        </p>
      </div>
    </div>
  )
}
