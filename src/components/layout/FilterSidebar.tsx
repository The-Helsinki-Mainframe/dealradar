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

// ─── Sub-components defined OUTSIDE FilterSidebar ───────────────────────────
// Critical: defining these inside would create new function identities on every
// render, causing React to unmount/remount the entire sidebar on each keystroke.

interface SectionProps {
  id: string
  sectionBorder: string
  children: React.ReactNode
}
function Section({ id, sectionBorder, children }: SectionProps) {
  return (
    <div id={id} style={{ padding: '13px 15px', borderBottom: `1px solid ${sectionBorder}` }}>
      {children}
    </div>
  )
}

interface SectionLabelProps {
  labelColor: string
  children: React.ReactNode
}
function SectionLabel({ labelColor, children }: SectionLabelProps) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
      {children}
    </span>
  )
}

interface ChipBtnProps {
  label: string
  active: boolean
  isDark: boolean
  onToggle: () => void
}
function ChipBtn({ label, active, isDark, onToggle }: ChipBtnProps) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onToggle() }}
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

// ─── FilterSidebar ───────────────────────────────────────────────────────────

export function FilterSidebar({ isDark, onDrawArea, onClearDraw, hasDrawnArea, filters, onChange, onClear }: FilterSidebarProps) {
  const [streets, setStreets] = useState<string[]>([])
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Local state for numeric inputs — decoupled from filter state so typing is instant.
  // We only push to parent on blur or Enter (never mid-keystroke).
  const [localPrice, setLocalPrice] = useState({ min: filters.priceMin, max: filters.priceMax })
  const [localPpm2,  setLocalPpm2]  = useState({ min: filters.ppm2Min,  max: filters.ppm2Max  })
  const [localSize,  setLocalSize]  = useState({ min: filters.sizeMin,  max: filters.sizeMax  })

  // Refs so commit functions always read latest values regardless of closure age.
  const localPriceRef = useRef(localPrice)
  const localPpm2Ref  = useRef(localPpm2)
  const localSizeRef  = useRef(localSize)
  const filtersRef    = useRef(filters)

  useEffect(() => { localPriceRef.current = localPrice }, [localPrice])
  useEffect(() => { localPpm2Ref.current  = localPpm2  }, [localPpm2])
  useEffect(() => { localSizeRef.current  = localSize  }, [localSize])
  useEffect(() => { filtersRef.current    = filters    }, [filters])

  // Sync local state when parent resets filters externally (Clear all)
  useEffect(() => { setLocalPrice({ min: filters.priceMin, max: filters.priceMax }) }, [filters.priceMin, filters.priceMax])
  useEffect(() => { setLocalPpm2({ min: filters.ppm2Min,   max: filters.ppm2Max  }) }, [filters.ppm2Min,  filters.ppm2Max])
  useEffect(() => { setLocalSize({ min: filters.sizeMin,   max: filters.sizeMax  }) }, [filters.sizeMin,  filters.sizeMax])

  // Commit functions read from refs — always fresh, no stale closure issue
  const commitPrice = () => onChange({ ...filtersRef.current, priceMin: localPriceRef.current.min, priceMax: localPriceRef.current.max })
  const commitPpm2  = () => onChange({ ...filtersRef.current, ppm2Min:  localPpm2Ref.current.min,  ppm2Max:  localPpm2Ref.current.max  })
  const commitSize  = () => onChange({ ...filtersRef.current, sizeMin:  localSizeRef.current.min,  sizeMax:  localSizeRef.current.max  })

  function onEnterKey(e: React.KeyboardEvent, commit: () => void) {
    if (e.key === 'Enter') { e.preventDefault(); commit(); (e.target as HTMLElement).blur() }
  }

  // Style helpers
  const bg           = isDark ? '#1e293b' : 'white'
  const border       = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
  const sectionBorder = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'
  const labelColor   = isDark ? '#64748b' : '#94a3b8'
  const textColor    = isDark ? '#e2e8f0' : '#1e293b'
  const inputBg      = isDark ? '#0f172a' : '#f8fafc'

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

  function toggleChip(key: 'rooms' | 'floors', val: string) {
    const el = sidebarRef.current
    const scrollTop = el?.scrollTop ?? 0
    const arr = filters[key] as string[]
    const newArr = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
    onChange({ ...filters, [key]: newArr })
    requestAnimationFrame(() => { if (el) el.scrollTop = scrollTop })
  }

  const sl = (children: React.ReactNode) => <SectionLabel labelColor={labelColor}>{children}</SectionLabel>
  const sc = (id: string, children: React.ReactNode) => <Section id={id} sectionBorder={sectionBorder}>{children}</Section>

  return (
    <aside
      id="sidebar"
      ref={sidebarRef}
      style={{ width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)', background: bg, borderRight: `1px solid ${border}`, overflowY: 'auto', flexShrink: 0 }}
    >
      {/* Data source — toggle pills */}
      {sc('filter-sources', <>
        {sl('Data source')}
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: 'sscom',   label: '🏠 ss.com'   },
            { key: 'city24',  label: '🔵 City24'   },
            { key: 'izsoles', label: '⚖️ Auctions' },
          ].map(({ key, label }) => {
            const active = (filters.sources ?? ['sscom','city24','izsoles']).includes(key)
            return (
              <ChipBtn
                key={key}
                label={label}
                active={active}
                isDark={isDark}
                onToggle={() => {
                  const cur = filters.sources ?? ['sscom','city24','izsoles']
                  const next = active ? cur.filter(s => s !== key) : [...cur, key]
                  set('sources', next.length > 0 ? next : cur)
                }}
              />
            )
          })}
        </div>
      </>)}

      {/* Region + Street */}
      {sc('filter-region', <>
        {sl('Region')}
        <select value={filters.district} onChange={e => onChange({ ...filters, district: e.target.value, street: '' })} style={{ ...inputStyle, marginBottom: 8 }}>
          <option value="">All regions</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {sl('Street')}
        <select value={filters.street} onChange={e => set('street', e.target.value)} style={inputStyle} disabled={streets.length === 0}>
          <option value="">All streets</option>
          {streets.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {filters.district && streets.length === 0 && (
          <p style={{ fontSize: 10, color: labelColor, marginTop: 4 }}>Loading streets…</p>
        )}
      </>)}

      {/* Price */}
      {sc('filter-price', <>
        {sl('Price (€)')}
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min"
            value={localPrice.min}
            onChange={e => setLocalPrice(p => ({ ...p, min: e.target.value }))}
            onBlur={commitPrice}
            onKeyDown={e => onEnterKey(e, commitPrice)}
            style={inputStyle}
          />
          <span style={{ color: '#cbd5e1', fontSize: 11, flexShrink: 0 }}>—</span>
          <input type="number" placeholder="Max"
            value={localPrice.max}
            onChange={e => setLocalPrice(p => ({ ...p, max: e.target.value }))}
            onBlur={commitPrice}
            onKeyDown={e => onEnterKey(e, commitPrice)}
            style={inputStyle}
          />
        </div>
        <p style={{ fontSize: 10, color: labelColor, marginTop: 4 }}>Press Enter or click away to apply</p>
      </>)}

      {/* €/m² */}
      {sc('filter-price-m2', <>
        {sl('Price per m² (€/m²)')}
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min"
            value={localPpm2.min}
            onChange={e => setLocalPpm2(p => ({ ...p, min: e.target.value }))}
            onBlur={commitPpm2}
            onKeyDown={e => onEnterKey(e, commitPpm2)}
            style={inputStyle}
          />
          <span style={{ color: '#cbd5e1', fontSize: 11, flexShrink: 0 }}>—</span>
          <input type="number" placeholder="Max"
            value={localPpm2.max}
            onChange={e => setLocalPpm2(p => ({ ...p, max: e.target.value }))}
            onBlur={commitPpm2}
            onKeyDown={e => onEnterKey(e, commitPpm2)}
            style={inputStyle}
          />
        </div>
        <p style={{ fontSize: 10, color: labelColor, marginTop: 4 }}>Press Enter or click away to apply</p>
      </>)}

      {/* Size */}
      {sc('filter-size', <>
        {sl('Size (m²)')}
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min"
            value={localSize.min}
            onChange={e => setLocalSize(p => ({ ...p, min: e.target.value }))}
            onBlur={commitSize}
            onKeyDown={e => onEnterKey(e, commitSize)}
            style={inputStyle}
          />
          <span style={{ color: '#cbd5e1', fontSize: 11, flexShrink: 0 }}>—</span>
          <input type="number" placeholder="Max"
            value={localSize.max}
            onChange={e => setLocalSize(p => ({ ...p, max: e.target.value }))}
            onBlur={commitSize}
            onKeyDown={e => onEnterKey(e, commitSize)}
            style={inputStyle}
          />
        </div>
        <p style={{ fontSize: 10, color: labelColor, marginTop: 4 }}>Press Enter or click away to apply</p>
      </>)}

      {/* Rooms */}
      {sc('filter-rooms', <>
        {sl('Rooms')}
        <div className="flex flex-wrap gap-1.5">
          {['Studio', '1', '2', '3', '4', '5+'].map(r => (
            <ChipBtn key={r} label={r} active={filters.rooms.includes(r)} isDark={isDark} onToggle={() => toggleChip('rooms', r)} />
          ))}
        </div>
      </>)}

      {/* Floor */}
      {sc('filter-floor', <>
        {sl('Floor level')}
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {['1', '2', '3', '4', '5', '6+', 'Top'].map(fl => (
            <ChipBtn key={fl} label={fl} active={filters.floors.includes(fl)} isDark={isDark} onToggle={() => toggleChip('floors', fl)} />
          ))}
        </div>
        <p style={{ fontSize: 10, color: labelColor }}>Deselect floor 1 &amp; Top to exclude ground &amp; attic flats</p>
      </>)}

      {/* Other */}
      {sc('filter-other', <>
        {sl('Other')}
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
      </>)}

      {/* Draw area */}
      {sc('filter-draw', <>
        {sl('Map area')}
        <button type="button" onClick={onDrawArea}
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
      </>)}

      {/* Clear all */}
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
