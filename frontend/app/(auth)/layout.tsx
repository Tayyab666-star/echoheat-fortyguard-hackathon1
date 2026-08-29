import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch {
    // NEXTAUTH_SECRET not configured — allow access to auth pages
  }
  if (session) redirect("/dashboard")
  return <>{children}</>
}
