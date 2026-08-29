import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"
import type { User } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}

export const authOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE"
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const res = await fetch(
            `${process.env.BACKEND_URL}/api/v1/auth/login`,
            {
              method: "POST",
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              headers: { "Content-Type": "application/json" },
            }
          )

          if (!res.ok) {
            const text = await res.text()
            let message = "Invalid credentials"
            try {
              const json = JSON.parse(text)
              message = json.message || message
            } catch {
              message = `Backend unavailable (${res.status})`
            }
            throw new Error(message)
          }

          const json = await res.json()
          if (json.data) {
            return json.data as User
          }
          throw new Error("Invalid response from backend")
        } catch (error) {
          if (error instanceof Error) {
            throw error
          }
          throw new Error("Unable to connect to authentication server")
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) token.accessToken = (user as any).accessToken
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
