"use client"

import { OnboardingShell } from "@/app/onboarding/components/OnboardingShell"
import { PilotReadyStep } from "@/app/onboarding/components/PilotReadyStep"

export default function PilotReadyPage() {
  return (
    <OnboardingShell stepIndex={3} prevHref="/onboarding/configure" hideNav>
      <PilotReadyStep />
    </OnboardingShell>
  )
}
