import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"

import { GeistSans, GeistMono } from "@/lib/fonts"
import { Providers } from "@/components/Providers"
import { InitialLoadingScreen } from "@/components/layout/InitialLoadingScreen"

import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "EchoHeat",
    template: "%s | EchoHeat",
  },
  description:
    "Autonomous Thermal Orchestration Engine — real-time thermal telemetry, anomaly detection, and orchestration control.",
}

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var prefs = JSON.parse(localStorage.getItem('echoheat-preferences') || '{}');
    var theme = prefs.theme || 'thermal-dark';
    document.documentElement.setAttribute('data-theme', theme);
    if (prefs.reducedMotion) document.documentElement.classList.add('reduce-motion');
    if (prefs.highContrast) document.documentElement.classList.add('high-contrast');
    if (prefs.fontSize === 'small') document.documentElement.classList.add('font-size-small');
    if (prefs.fontSize === 'large') document.documentElement.classList.add('font-size-large');
  } catch(e) {
    try {
      var legacy = localStorage.getItem('echoheat-theme') || 'thermal-dark';
      document.documentElement.setAttribute('data-theme', legacy);
    } catch(e2) {
      document.documentElement.setAttribute('data-theme', 'thermal-dark');
    }
  }
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ClerkProvider>
          <InitialLoadingScreen />
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
