'use client'

import { useState, useEffect, useRef } from 'react'

export interface FilterState {
  district: string
  street: string
  priceMin: string
  priceMax: string
  ppm2Min: string
  ppm2Max: string
  sizeMin: string
  sizeMax: string
  rooms: string[]
  floors: string[]
  hasLift: boolean
  sources: string[]  // 'sscom' | 'city24' | 'izsoles'
}

export const EMPTY_FILTERS: FilterState = {
  district: '', street: '', priceMin: '', priceMax: '',
  ppm2Min: '', ppm2Max: '', sizeMin: '', sizeMax: '',
  rooms: [], floors: [], hasLift: false,
  sources: ['sscom', 'city24', 'izsoles'],
}

interface FilterSidebarProps {
  isDark: boolean
  onDrawArea: () => void
  onClearDraw: () => void
  hasDrawnArea: boolean
  filters: FilterState
  onChange: (f: FilterState) => void
  onClear: () => void
}

const REGIONS = [
  'Centrs', 'Teika', 'Āgenskalns', 'Purvciems', 'Imanta',
  'Ziepniekkalns', 'Mežciems', 'Pļavnieki', 'Jugla',
  'Sarkandaugava', 'Vecmīlgrāvis', 'Bolderāja',
]

export function FilterSidebar({ isDark, onDrawArea, onClearDraw, hasDrawnArea, filters, onChange, onClear }: FilterSidebarProps) {
  const [streets, setStreets] = useState<string[]>([])
  const sidebarRef = useRef<HTMLDivElement>(null)

  const bg = isDark ? '#1e293b' : 'white'
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
  const sectionBorder = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'
  const labelColor = isDark ? '#64748b' : '#94a3b8'
  const textColor = isDark ? '#e2e8f0' : '#1e293b'
  const inputBg = isDark ? '#0f172a' : '#f8fafc'

  const inputStyle = {
    width: '100%',
    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
    borderRadius: 8,
    padding: '7px 10px',
    fontSize: 12,
    color: textColor,
    background: inputBg,
    outline: 'none',
  }

  // Fetch streets when district changes
  useEffect(() => {
    if (!filters.district) { setStreets([]); return }
    fetch(`/api/streets?district=${encodeURIComponent(filters.district)}`)
      .then(r => r.json())
      .then(setStreets)
      .catch(() => setStreets([]))
  }, [filters.district])

  function set<K extends keyof FilterState>(key: K, val: FilterState[K]) {
    onChange({ ...filters, [key]: val })
  }

  function handleDistrictChange(newDistrict: string) {
    // Clear street when district changes
    onChange({ ...filters, district: newDistrict, street: '' })
  }

  function toggleChip(key: 'rooms' | 'floors', val: string) {
    // Save + restore scroll to prevent jump on chip toggle
    const el = sidebarRef.current
    const scrollTop = el?.scrollTop ?? 0
    const arr = filters[key] as string[]
    const newArr = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
    onChange({ ...filters, [key]: newArr })
    requestAnimationFrame(() => { if (el) el.scrollTop = scrollTop })
  }

  function ChipBtn({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
    return (
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); onToggle() }} // preventDefault stops focus scroll
        className="text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all"
        style={
          active
            ? { background: '#6366f1', borderColor: '#6366f1', color: 'white' }
            : { background: isDark ? '#0f172a' : 'white', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0', color: isDark ? '#94a3b8' : '#64748b' }
        }
      >
        {label}
      </button>
    )
  }

  function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
      <span style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
        {children}
      </span>
    )
  }

  function Section({ id, children }: { id: string; children: React.ReactNode }) {
    return (
      <div id={id} style={{ padding: '13px 15px', borderBottom: `1px solid ${sectionBorder}` }}>
        {children}
      </div>
    )
  }

  return (
    <aside
      id="sidebar"
      ref={sidebarRef}
      style={{ width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)', background: bg, borderRight: `1px solid ${border}`, overflowY: 'auto', flexShrink: 0 }}
    >
      {/* Data source */}
      <Section id="filter-sources">
        <SectionLabel>Data source</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {['ss.com', 'City24', '🔨 Auctions'].map((src, i) => (
            <button key={src} type="button" className="text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all"
              style={i === 0
                ? { background: '#6366f1', borderColor: '#6366f1', color: 'white' }
                : { opacity: 0.4, cursor: 'default', background: isDark ? '#0f172a' : 'white', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0', color: isDark ? '#94a3b8' : '#64748b' }}
              title={i > 0 ? 'Coming Phase 1' : undefined}
            >{src}</button>
          ))}
        </div>
      </Section>

      {/* Property type */}
      <Section id="filter-type">
        <SectionLabel>Property type</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {['Apartments', 'Houses', 'Commercial'].map((t, i) => (
            <button key={t} type="button" className="text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all"
              style={i === 0
                ? { background: '#6366f1', borderColor: '#6366f1', color: 'white' }
                : { opacity: 0.4, cursor: 'default', background: isDark ? '#0f172a' : 'white', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0', color: isDark ? '#94a3b8' : '#64748b' }}
              title={i > 0 ? 'Coming Phase 1' : undefined}
            >{t}</button>
          ))}
        </div>
      </Section>

      {/* Region + Street */}
      <Section id="filter-region">
        <SectionLabel>Region</SectionLabel>
        <select value={filters.district} onChange={e => handleDistrictChange(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }}>
          <option value="">All regions</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <SectionLabel>Street</SectionLabel>
        <select value={filters.street} onChange={e => set('street', e.target.value)} style={inputStyle} disabled={streets.length === 0}>
          <option value="">All streets</option>
          {streets.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {filters.district && streets.length === 0 && (
          <p style={{ fontSize: 10, color: labelColor, marginTop: 4 }}>Loading streets…</p>
        )}
      </Section>

      {/* Price */}
      <Section id="filter-price">
        <SectionLabel>Price (€)</SectionLabel>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={filters.priceMin} onChange={e => set('priceMin', e.target.value)} style={inputStyle} />
          <span style={{ color: '#cbd5e1', fontSize: 11, flexShrink: 0 }}>—</span>
          <input type="number" placeholder="Max" value={filters.priceMax} onChange={e => set('priceMax', e.target.value)} style={inputStyle} />
        </div>
      </Section>

      {/* €/m² */}
      <Section id="filter-price-m2">
        <SectionLabel>Price per m² (€/m²)</SectionLabel>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={filters.ppm2Min} onChange={e => set('ppm2Min', e.target.value)} style={inputStyle} />
          <span style={{ color: '#cbd5e1', fontSize: 11, flexShrink: 0 }}>—</span>
          <input type="number" placeholder="Max" value={filters.ppm2Max} onChange={e => set('ppm2Max', e.target.value)} style={inputStyle} />
        </div>
      </Section>

      {/* Size */}
      <Section id="filter-size">
        <SectionLabel>Size (m²)</SectionLabel>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={filters.sizeMin} onChange={e => set('sizeMin', e.target.value)} style={inputStyle} />
          <span style={{ color: '#cbd5e1', fontSize: 11, flexShrink: 0 }}>—</span>
          <input type="number" placeholder="Max" value={filters.sizeMax} onChange={e => set('sizeMax', e.target.value)} style={inputStyle} />
        </div>
      </Section>

      {/* Rooms */}
      <Section id="filter-rooms">
        <SectionLabel>Rooms</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {['Studio', '1', '2', '3', '4', '5+'].map(r => (
            <ChipBtn key={r} label={r} active={filters.rooms.includes(r)} onToggle={() => toggleChip('rooms', r)} />
          ))}
        </div>
      </Section>

      {/* Floor */}
      <Section id="filter-floor">
        <SectionLabel>Floor level</SectionLabel>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {['1', '2', '3', '4', '5', '6+', 'Top'].map(fl => (
            <ChipBtn key={fl} label={fl} active={filters.floors.includes(fl)} onToggle={() => toggleChip('floors', fl)} />
          ))}
        </div>
        <p style={{ fontSize: 10, color: labelColor }}>Deselect floor 1 &amp; Top to exclude ground &amp; attic flats</p>
      </Section>

      {/* Building type — Phase 1 */}
      <Section id="filter-building-type">
        <SectionLabel>Building type</SectionLabel>
        <div className="flex flex-col gap-1.5">
          {['Pre-war', 'New-build', 'Renovated', 'Soviet panel', 'Stalin-era'].map(bt => (
            <label key={bt} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#475569' }}>
              <input type="checkbox" style={{ accentColor: '#6366f1' }} readOnly /> {bt}
            </label>
          ))}
        </div>
        <p style={{ fontSize: 10, color: labelColor, marginTop: 4 }}>Building type filter coming soon</p>
      </Section>

      {/* Sources */}
      <Section id="filter-sources-check">
        <SectionLabel>Sources</SectionLabel>
        <div className="flex flex-col gap-1.5">
          {[
            { key: 'sscom',   label: 'SS.com',   emoji: '🏠' },
            { key: 'city24',  label: 'City24',   emoji: '🔵' },
            { key: 'izsoles', label: 'Auctions', emoji: '⚖️' },
          ].map(({ key, label, emoji }) => {
            const active = (filters.sources ?? ['sscom','city24','izsoles']).includes(key)
            return (
              <label key={key} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#475569' }}>
                <input
                  type="checkbox"
                  style={{ accentColor: '#6366f1' }}
                  checked={active}
                  onChange={e => {
                    const cur = filters.sources ?? ['sscom','city24','izsoles']
                    set('sources', e.target.checked ? [...cur, key] : cur.filter(s => s !== key))
                  }}
                />
                {emoji} {label}
              </label>
            )
          })}
        </div>
      </Section>

      {/* Other */}
      <Section id="filter-other">
        <SectionLabel>Other</SectionLabel>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#475569' }}>
            <input type="checkbox" style={{ accentColor: '#6366f1' }} checked={filters.hasLift}
              onChange={e => set('hasLift', e.target.checked)} />
            Has lift
          </label>
          {['Price reduced', 'New this week'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#475569', opacity: 0.5 }}>
              <input type="checkbox" style={{ accentColor: '#6366f1' }} disabled /> {opt} <span style={{ fontSize: 10 }}>(soon)</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Draw area */}
      <Section id="filter-draw">
        <SectionLabel>Map area</SectionLabel>
        <button type="button" id="draw-btn" onClick={onDrawArea}
          className="w-full flex items-center justify-center gap-2 text-[12px] font-semibold rounded-xl transition-all"
          style={{ color: '#6366f1', background: isDark ? 'rgba(99,102,241,0.08)' : 'white', border: '2px dashed #c7d2fe', padding: '10px', cursor: 'pointer' }}
        >
          ✏️ Draw area on map
        </button>
        {hasDrawnArea && (
          <button type="button" onClick={onClearDraw}
            className="w-full text-[11px] font-semibold mt-1.5 py-1.5 rounded-lg border transition-all"
            style={{ color: '#ef4444', background: 'white', borderColor: '#fecaca' }}
          >
            ✕ Clear drawn area
          </button>
        )}
        <p style={{ fontSize: 10, color: labelColor, marginTop: 5, textAlign: 'center' }}>
          Filter by drawing a polygon on the map
        </p>
      </Section>

      {/* Clear all (no Apply button — filters are live) */}
      <div style={{ padding: '13px 15px' }}>
        <button type="button" onClick={onClear}
          className="w-full text-[11px] py-1.5 border-none cursor-pointer rounded-lg"
          style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9', color: labelColor }}
        >
          Clear all filters
        </button>
      </div>
    </aside>
  )
}
