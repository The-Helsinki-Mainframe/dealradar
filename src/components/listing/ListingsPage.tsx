'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Nav } from '@/components/layout/Nav'
import { FilterSidebar, FilterState, EMPTY_FILTERS } from '@/components/layout/FilterSidebar'
import { ListingCard } from '@/components/listing/ListingCard'
import { AlertModal } from '@/components/layout/AlertModal'
import type { PaginatedListings } from '@/types/listing'

const ListingsMap = dynamic(() => import('@/components/map/ListingsMap').then(m => m.ListingsMap), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#1e293b' }} />,
})

function buildQueryString(page: number, sort: string, filters: FilterState): string {
  const p = new URLSearchParams()
  p.set('page', String(page))
  p.set('sort', sort)
  if (filters.district) p.set('district', filters.district)
  if (filters.street)   p.set('street',   filters.street)
  if (filters.priceMin) p.set('priceMin', filters.priceMin)
  if (filters.priceMax) p.set('priceMax', filters.priceMax)
  if (filters.ppm2Min)  p.set('ppm2Min',  filters.ppm2Min)
  if (filters.ppm2Max)  p.set('ppm2Max',  filters.ppm2Max)
  if (filters.sizeMin)  p.set('sizeMin',  filters.sizeMin)
  if (filters.sizeMax)  p.set('sizeMax',  filters.sizeMax)
  filters.rooms.forEach(r  => p.append('rooms',  r))
  filters.floors.forEach(f => p.append('floors', f))
  if (filters.hasLift)  p.set('hasLift', '1')
  const activeSources = filters.sources ?? ['sscom','city24','izsoles']
  if (activeSources.length < 3) {
    activeSources.forEach(s => p.append('source', s))
  }
  return p.toString()
}

export function ListingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const cardsPanelRef = useRef<HTMLDivElement>(null)

  const [data,          setData]          = useState<PaginatedListings | null>(null)
  const [allMarkers,    setAllMarkers]    = useState<import('@/types/listing').MapMarker[]>([])
  const [loading,       setLoading]       = useState(true)
  const [view,          setView]          = useState<'all' | 'map' | 'list'>('all')
  const [isDark,        setIsDark]        = useState(false)
  const [alertOpen,     setAlertOpen]     = useState(false)
  const [selectedId,    setSelectedId]    = useState<string | null>(null)
  const [filteredIds,   setFilteredIds]   = useState<string[] | null>(null)
  const [hasDrawnArea,  setHasDrawnArea]  = useState(false)
  const [sort,          setSort]          = useState('score-desc')
  const [activeFilters, setActiveFilters] = useState<FilterState>(EMPTY_FILTERS)

  const page = parseInt(searchParams.get('page') || '1')

  // Fetch paginated listings (cards panel)
  useEffect(() => {
    setLoading(true)
    const qs = buildQueryString(page, sort, activeFilters)
    fetch(`/api/listings?${qs}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [page, sort, activeFilters])

  // Fetch ALL markers for current filters (map shows everything, not just current page)
  useEffect(() => {
    const fp = new URLSearchParams()
    if (activeFilters.district) fp.set('district', activeFilters.district)
    if (activeFilters.street)   fp.set('street',   activeFilters.street)
    if (activeFilters.priceMin) fp.set('priceMin', activeFilters.priceMin)
    if (activeFilters.priceMax) fp.set('priceMax', activeFilters.priceMax)
    if (activeFilters.ppm2Min)  fp.set('ppm2Min',  activeFilters.ppm2Min)
    if (activeFilters.ppm2Max)  fp.set('ppm2Max',  activeFilters.ppm2Max)
    if (activeFilters.sizeMin)  fp.set('sizeMin',  activeFilters.sizeMin)
    if (activeFilters.sizeMax)  fp.set('sizeMax',  activeFilters.sizeMax)
    activeFilters.rooms.forEach(r  => fp.append('rooms',  r))
    activeFilters.floors.forEach(f => fp.append('floors', f))
    if (activeFilters.hasLift)  fp.set('hasLift', '1')
    const activeSources = activeFilters.sources ?? ['sscom','city24','izsoles']
    if (activeSources.length < 3) {
      activeSources.forEach(s => fp.append('source', s))
    }
    fetch(`/api/markers?${fp.toString()}`)
      .then(r => r.json())
      .then(setAllMarkers)
      .catch(() => setAllMarkers([]))
  }, [activeFilters])

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId(id)
    const panel = cardsPanelRef.current
    const card  = document.getElementById(`card-${id}`)
    if (panel && card) {
      // Scroll so the card appears near the vertical centre of the panel
      const panelRect = panel.getBoundingClientRect()
      const cardRect  = card.getBoundingClientRect()
      const relativeTop = cardRect.top - panelRect.top + panel.scrollTop
      const target = relativeTop - (panelRect.height / 2) + (cardRect.height / 2)
      panel.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
    }
  }, [])

  const handlePolygonFilter = useCallback((ids: string[] | null) => {
    setFilteredIds(ids)
    setHasDrawnArea(ids !== null)
  }, [])

  const handleDrawArea = useCallback(() => { (window as any).__dealradar_startDraw?.() }, [])
  const handleClearDraw = useCallback(() => {
    ;(window as any).__dealradar_clearDraw?.()
    setFilteredIds(null)
    setHasDrawnArea(false)
  }, [])

  const handleApplyFilters = useCallback((f: FilterState) => {
    setActiveFilters(f)
    setFilteredIds(null)   // clear polygon filter when applying sidebar filters
    setHasDrawnArea(false)
    router.push(`/?page=1&sort=${sort}`)
  }, [sort, router])

  const handleClearFilters = useCallback(() => {
    setActiveFilters(EMPTY_FILTERS)
    setFilteredIds(null)
    setHasDrawnArea(false)
    router.push(`/?page=1&sort=${sort}`)
  }, [sort, router])

  const handlePageChange = (newPage: number) => {
    router.push(`/?page=${newPage}&sort=${sort}`)
  }

  const visibleListings = data?.listings.filter(l =>
    filteredIds === null || filteredIds.includes(l.listing_id)
  ) ?? []

  const resultCount = filteredIds !== null ? filteredIds.length : (data?.total ?? 0)
  const isMapHidden      = view === 'list'
  const isCardsHidden    = view === 'map'
  const isCardsExpanded  = view === 'list'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: isDark ? '#0f172a' : '#f8fafc' }}>
      <Nav view={view} onViewChange={setView} isDark={isDark} onDarkToggle={() => setIsDark(d => !d)} onAlertOpen={() => setAlertOpen(true)}
        onLogoClick={() => { handleClearFilters(); setView('all') }}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <FilterSidebar
          isDark={isDark}
          onDrawArea={handleDrawArea}
          onClearDraw={handleClearDraw}
          hasDrawnArea={hasDrawnArea}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />

        {/* Map — uses all markers (not just current page), filtered to polygon if drawn */}
        {!isMapHidden && (
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <ListingsMap
              markers={filteredIds !== null
                ? allMarkers.filter(m => filteredIds.includes(m.id))
                : allMarkers}
              isDark={isDark}
              selectedId={selectedId}
              onMarkerClick={handleMarkerClick}
              onPolygonFilter={handlePolygonFilter}
              allMarkersForPolygon={allMarkers}
            />
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
              color: '#e2e8f0', fontSize: 11, fontWeight: 600,
              padding: '5px 10px', borderRadius: 8, zIndex: 1000,
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              {filteredIds !== null ? `${filteredIds.length} in area` : `${allMarkers.length} listings`}
            </div>
          </div>
        )}

        {/* Cards panel */}
        {!isCardsHidden && (
          <div
            id="cards-panel"
            ref={cardsPanelRef}
            style={{
              width: isCardsExpanded ? `calc(100vw - var(--sidebar-width))` : '340px',
              minWidth: isCardsExpanded ? 0 : '340px',
              borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
              background: isDark ? '#0f172a' : '#f8fafc',
              overflowY: 'auto',
              padding: 12,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10, paddingBottom: 9,
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}`,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#475569' : '#475569' }}>
                {loading ? '…' : `${resultCount} ${filteredIds !== null ? 'in area' : 'listings'} · p.${page}/${data?.totalPages ?? 1}`}
              </span>
              <select value={sort}
                onChange={e => { setSort(e.target.value); router.push(`/?page=1&sort=${e.target.value}`) }}
                style={{
                  fontSize: 11, border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                  borderRadius: 8, padding: '4px 8px',
                  color: isDark ? '#94a3b8' : '#475569',
                  background: isDark ? '#1e293b' : 'white',
                  outline: 'none',
                }}
              >
                <option value="score-desc">Deal Score ↓</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="ppm2-asc">€/m² ↑</option>
                <option value="ppm2-desc">€/m² ↓</option>
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
              </select>
            </div>

            {/* Grid */}
            <div style={{
              display: 'grid', gap: 10,
              gridTemplateColumns: isCardsExpanded ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
            }}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ height: 280, borderRadius: 12, background: isDark ? '#1e293b' : '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
                  ))
                : visibleListings.map(l => (
                    <ListingCard key={l.listing_id} listing={l} page={page} isDark={isDark}
                      isSelected={selectedId === l.listing_id}
                      onClick={() => handleMarkerClick(l.listing_id)}
                    />
                  ))
              }
            </div>

            {/* Pagination */}
            {data && !loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 4px 4px' }}>
                <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}
                  style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: page <= 1 ? 'default' : 'pointer', border: `1.5px solid ${page <= 1 ? '#f1f5f9' : '#e2e8f0'}`, color: page <= 1 ? '#cbd5e1' : '#6366f1', background: page <= 1 ? '#f8fafc' : 'white' }}
                >← Prev</button>
                <span style={{ fontSize: 11, color: isDark ? '#475569' : '#94a3b8' }}>Page {page} of {data.totalPages}</span>
                <button onClick={() => handlePageChange(page + 1)} disabled={page >= data.totalPages}
                  style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: page >= data.totalPages ? 'default' : 'pointer', border: `1.5px solid ${page >= data.totalPages ? '#f1f5f9' : '#e2e8f0'}`, color: page >= data.totalPages ? '#cbd5e1' : '#6366f1', background: page >= data.totalPages ? '#f8fafc' : 'white' }}
                >Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} isDark={isDark} />
    </div>
  )
}
