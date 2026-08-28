"use client"

import { OnboardingShell } from "@/app/onboarding/components/OnboardingShell"
import { WelcomeStep } from "@/app/onboarding/components/WelcomeStep"

export default function WelcomePage() {
  return (
    <OnboardingShell stepIndex={0} nextHref="/onboarding/connect">
      <WelcomeStep />
    </OnboardingShell>
  )
}
