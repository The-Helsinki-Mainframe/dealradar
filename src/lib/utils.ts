import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return '€' + Math.round(price).toLocaleString('lv-LV').replace(/,/g, ' ')
}

export function formatPricePerM2(price: number): string {
  return '€' + Math.round(price).toLocaleString('lv-LV') + '/m²'
}

export function scoreColor(score: number | null): string {
  if (!score) return '#94a3b8'
  if (score >= 8) return '#10b981'
  if (score >= 6) return '#f59e0b'
  return '#ef4444'
}

export function scoreLabel(score: number | null): string {
  if (!score) return '—'
  if (score >= 9) return '🔥 Hot'
  if (score >= 8) return '✅ Strong'
  if (score >= 7) return '👍 Good'
  if (score >= 6) return '⚠️ Fair'
  return '❌ Weak'
}

export function buildingBadge(buildingType: string | null): string {
  if (!buildingType) return ''
  if (buildingType.includes('P. kara') || buildingType.toLowerCase().includes('kara')) return 'Pre-war'
  if (buildingType.includes('Jaun')) return 'New-build'
  if (buildingType.includes('Renov')) return 'Renovated'
  if (buildingType.includes('Staļin')) return 'Stalin-era'
  if (buildingType.toLowerCase().includes('sērij') || buildingType.toLowerCase().includes('serij')) return 'Soviet panel'
  return buildingType.slice(0, 12)
}

export function daysAgo(date: Date | null): string {
  if (!date) return ''
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${diff}d ago`
}
