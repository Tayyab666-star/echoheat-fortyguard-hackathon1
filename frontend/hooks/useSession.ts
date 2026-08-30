"use client"

import { useUser } from "@clerk/nextjs"

export function useSession() {
  const { user, isLoaded } = useUser()

  return {
    data: user
      ? {
          user: {
            name: user.fullName || user.firstName || "User",
            email: user.emailAddresses?.[0]?.emailAddress || "",
            image: user.imageUrl,
          },
        }
      : null,
    status: isLoaded ? (user ? "authenticated" : "unauthenticated") : "loading",
  }
}
