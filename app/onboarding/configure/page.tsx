"use client"

import { OnboardingShell } from "@/app/onboarding/components/OnboardingShell"
import { ConfigureStep } from "@/app/onboarding/components/ConfigureStep"

export default function ConfigurePage() {
  return (
    <OnboardingShell
      stepIndex={2}
      prevHref="/onboarding/connect"
      nextHref="/onboarding/pilot-ready"
    >
      <ConfigureStep />
    </OnboardingShell>
  )
}
