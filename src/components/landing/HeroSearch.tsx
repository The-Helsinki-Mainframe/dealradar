'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CITIES = [
  { value: 'riga', label: 'Riga' },
  { value: 'jurmala', label: 'Jūrmala' },
  { value: 'all', label: 'All Latvia' },
]

const TYPES = [
  { value: '', label: 'Any type' },
  { value: 'apartment', label: 'Apartments' },
  { value: 'house', label: 'Houses' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
]

const PRICE_RANGES = [
  { value: '', label: 'Any price' },
  { value: '0-50000', label: 'Under €50k' },
  { value: '50000-100000', label: '€50k – €100k' },
  { value: '100000-200000', label: '€100k – €200k' },
  { value: '200000-500000', label: '€200k – €500k' },
  { value: '500000-', label: '€500k+' },
]

interface HeroSearchProps {
  theme?: 'light' | 'dark'
}

export function HeroSearch({ theme = 'dark' }: HeroSearchProps) {
  const router = useRouter()
  const [city, setCity] = useState('riga')
  const [type, setType] = useState('')
  const [price, setPrice] = useState('')

  const isDark = theme === 'dark'

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city && city !== 'all') params.set('district', city)
    if (price) {
      const [min, max] = price.split('-')
      if (min) params.set('priceMin', min)
      if (max) params.set('priceMax', max)
    }
    router.push(`/search?${params.toString()}`)
  }

  const inputBase = isDark
    ? 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/15 focus:border-white/40'
    : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-500'

  const labelBase = isDark ? 'text-white/70' : 'text-stone-500'
  const btnBase = 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold tracking-wide transition-colors duration-200'

  return (
    <form
      onSubmit={handleSearch}
      className="w-full"
    >
      <div className={`
        rounded-2xl p-1.5 flex flex-col sm:flex-row gap-1.5
        ${isDark ? 'bg-white/10 backdrop-blur-md border border-white/15' : 'bg-white shadow-xl border border-stone-100'}
      `}>
        {/* City */}
        <div className="flex-1 flex flex-col px-4 py-2.5">
          <label className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${labelBase}`}>
            City
          </label>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className={`bg-transparent border-0 outline-none text-sm font-medium ${isDark ? 'text-white' : 'text-stone-900'} cursor-pointer`}
          >
            {CITIES.map(c => (
              <option key={c.value} value={c.value} className="text-stone-900 bg-white">
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className={`hidden sm:block w-px my-3 ${isDark ? 'bg-white/15' : 'bg-stone-200'}`} />

        {/* Type */}
        <div className="flex-1 flex flex-col px-4 py-2.5">
          <label className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${labelBase}`}>
            Type
          </label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className={`bg-transparent border-0 outline-none text-sm font-medium ${isDark ? 'text-white' : 'text-stone-900'} cursor-pointer`}
          >
            {TYPES.map(t => (
              <option key={t.value} value={t.value} className="text-stone-900 bg-white">
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className={`hidden sm:block w-px my-3 ${isDark ? 'bg-white/15' : 'bg-stone-200'}`} />

        {/* Price */}
        <div className="flex-1 flex flex-col px-4 py-2.5">
          <label className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${labelBase}`}>
            Budget
          </label>
          <select
            value={price}
            onChange={e => setPrice(e.target.value)}
            className={`bg-transparent border-0 outline-none text-sm font-medium ${isDark ? 'text-white' : 'text-stone-900'} cursor-pointer`}
          >
            {PRICE_RANGES.map(p => (
              <option key={p.value} value={p.value} className="text-stone-900 bg-white">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <button
          type="submit"
          className={`${btnBase} rounded-xl px-8 py-3 text-sm whitespace-nowrap`}
        >
          Search →
        </button>
      </div>
    </form>
  )
}
