import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LandingPage } from "@/components/landing/LandingPage"

export default async function RootPage() {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch {
    // NEXTAUTH_SECRET not configured — render landing page without session
  }

  if (session) {
    redirect("/dashboard")
  }

  return <LandingPage />
}
