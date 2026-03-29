'use client'

import { useSearchParams } from 'next/navigation'
import { LandingVariantA } from './LandingVariantA'
import { LandingVariantB } from './LandingVariantB'
import { LandingVariantC } from './LandingVariantC'
import { LandingVariantD } from './LandingVariantD'

export function LandingPage() {
  const sp = useSearchParams()
  const variant = sp.get('v')
  if (variant === 'b') return <LandingVariantB />
  if (variant === 'c') return <LandingVariantC />
  if (variant === 'd') return <LandingVariantD />
  return <LandingVariantA />
}
