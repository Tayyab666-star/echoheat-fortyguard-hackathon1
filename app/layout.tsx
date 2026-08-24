import type { Metadata } from "next"

import { GeistSans, GeistMono } from "@/lib/fonts"
import { TooltipProvider } from "@/components/ui/tooltip"

import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "EchoHeat",
    template: "%s | EchoHeat",
  },
  description:
    "Autonomous Thermal Orchestration Engine — real-time thermal telemetry, anomaly detection, and orchestration control.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
