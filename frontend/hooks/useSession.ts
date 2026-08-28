"use client"

import * as React from "react"

interface SessionUser {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface Session {
  user?: SessionUser
  expires?: string
}

export function useSession() {
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session")
        if (!res.ok) {
          if (!cancelled) setSession(null)
          return
        }
        const data = await res.json()
        if (!cancelled) {
          setSession(data && data.user ? data : null)
        }
      } catch {
        if (!cancelled) setSession(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSession()
    return () => { cancelled = true }
  }, [])

  return { session, loading }
}
