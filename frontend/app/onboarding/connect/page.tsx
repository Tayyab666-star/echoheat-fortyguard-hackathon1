"use client"

import { OnboardingShell } from "@/app/onboarding/components/OnboardingShell"
import { ConnectIntegrationsStep } from "@/app/onboarding/components/ConnectIntegrationsStep"

export default function ConnectPage() {
  return (
    <OnboardingShell
      stepIndex={1}
      prevHref="/onboarding/welcome"
      nextHref="/onboarding/configure"
    >
      <ConnectIntegrationsStep />
    </OnboardingShell>
  )
}
