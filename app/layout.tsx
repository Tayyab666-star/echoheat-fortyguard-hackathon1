import type { Metadata } from "next"

import { GeistSans, GeistMono } from "@/lib/fonts"
import { Providers } from "@/components/Providers"

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
    var theme = localStorage.getItem('echoheat-theme') || 'thermal-dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'thermal-dark');
  }
  try {
    var a11y = JSON.parse(localStorage.getItem('echoheat-a11y') || '{}');
    if (a11y.reduceMotion) document.documentElement.classList.add('reduce-motion');
    if (a11y.highContrast) document.documentElement.classList.add('high-contrast');
    if (a11y.fontSize === 'small') document.documentElement.classList.add('font-size-small');
    if (a11y.fontSize === 'large') document.documentElement.classList.add('font-size-large');
  } catch(e) {}
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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
