'use client'

import { useSearchParams } from 'next/navigation'
import { LandingVariantA } from './LandingVariantA'
import { LandingVariantB } from './LandingVariantB'

export function LandingPage() {
  const sp = useSearchParams()
  const variant = sp.get('v')
  if (variant === 'b') return <LandingVariantB />
  return <LandingVariantA />
}
