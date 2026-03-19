'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Nav } from '@/components/layout/Nav'
import { FilterSidebar, FilterState, EMPTY_FILTERS } from '@/components/layout/FilterSidebar'
import { ListingCard } from '@/components/listing/ListingCard'
import { AlertModal } from '@/components/layout/AlertModal'
import type { PaginatedListings, MapMarker } from '@/types/listing'

const ListingsMap = dynamic(() => import('@/components/map/ListingsMap').then(m => m.ListingsMap), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#1e293b' }} />,
})

// ─── helpers ────────────────────────────────────────────────────────────────

function buildQueryString(page: number, sort: string, filters: FilterState, dark: boolean, view: string): string {
  const p = new URLSearchParams()
  p.set('page', String(page))
  p.set('sort', sort)
  if (dark) p.set('dark', '1')
  if (view !== 'all') p.set('view', view)
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

function filtersFromParams(sp: URLSearchParams): FilterState {
  return {
    district: sp.get('district') ?? '',
    street:   sp.get('street')   ?? '',
    priceMin: sp.get('priceMin') ?? '',
    priceMax: sp.get('priceMax') ?? '',
    ppm2Min:  sp.get('ppm2Min')  ?? '',
    ppm2Max:  sp.get('ppm2Max')  ?? '',
    sizeMin:  sp.get('sizeMin')  ?? '',
    sizeMax:  sp.get('sizeMax')  ?? '',
    rooms:    sp.getAll('rooms'),
    floors:   sp.getAll('floors'),
    hasLift:  sp.get('hasLift') === '1',
    sources:  sp.getAll('source').length > 0 ? sp.getAll('source') : ['sscom','city24','izsoles'],
  }
}

function hasActiveFilters(f: FilterState): boolean {
  return !!(
    f.district || f.street ||
    f.priceMin || f.priceMax ||
    f.ppm2Min  || f.ppm2Max  ||
    f.sizeMin  || f.sizeMax  ||
    f.rooms.length || f.floors.length ||
    f.hasLift
  )
}

// ─── client-side marker filtering ───────────────────────────────────────────

function applyFiltersToMarkers(markers: MapMarker[], filters: FilterState): MapMarker[] {
  const sources = filters.sources ?? ['sscom','city24','izsoles']
  const priceMin = filters.priceMin ? parseFloat(filters.priceMin) : null
  const priceMax = filters.priceMax ? parseFloat(filters.priceMax) : null
  const ppm2Min  = filters.ppm2Min  ? parseFloat(filters.ppm2Min)  : null
  const ppm2Max  = filters.ppm2Max  ? parseFloat(filters.ppm2Max)  : null
  const sizeMin  = filters.sizeMin  ? parseFloat(filters.sizeMin)  : null
  const sizeMax  = filters.sizeMax  ? parseFloat(filters.sizeMax)  : null

  return markers.filter(m => {
    if (!sources.includes(m.source ?? 'sscom')) return false
    if (filters.district && m.district?.toLowerCase() !== filters.district.toLowerCase()) return false
    if (filters.street && !m.street?.toLowerCase().includes(filters.street.toLowerCase())) return false
    if (priceMin !== null && m.price < priceMin) return false
    if (priceMax !== null && m.price > priceMax) return false
    const ppm2 = (m.area_m2 && m.price) ? m.price / m.area_m2 : null
    if (ppm2Min !== null && (ppm2 === null || ppm2 < ppm2Min)) return false
    if (ppm2Max !== null && (ppm2 === null || ppm2 > ppm2Max)) return false
    if (sizeMin !== null && (m.area_m2 == null || m.area_m2 < sizeMin)) return false
    if (sizeMax !== null && (m.area_m2 == null || m.area_m2 > sizeMax)) return false
    if (filters.rooms.length > 0) {
      const r = m.rooms
      const match = filters.rooms.some(fr => {
        if (fr === 'Studio') return r === 0 || r == null
        if (fr === '5+') return r != null && r >= 5
        return r === parseInt(fr)
      })
      if (!match) return false
    }
    if (filters.floors.length > 0) {
      const fl = m.floor
      const tot = m.total_floors
      const match = filters.floors.some(ff => {
        if (ff === '6+') return fl != null && fl >= 6
        if (ff === 'Top') return fl != null && tot != null && fl === tot
        return fl === parseInt(ff)
      })
      if (!match) return false
    }
    if (filters.hasLift && !m.has_lift) return false
    return true
  })
}

// ─── component ──────────────────────────────────────────────────────────────

export function ListingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const cardsPanelRef = useRef<HTMLDivElement>(null)

  // All markers — loaded once on mount
  const [allMarkers,   setAllMarkers]   = useState<MapMarker[]>([])
  const [markersReady, setMarkersReady] = useState(false)

  // Paginated listings — fetched per filter change
  const [data,    setData]    = useState<PaginatedListings | null>(null)
  const [loading, setLoading] = useState(false)

  // UI state — dark + view live in URL so Back restores them
  const [alertOpen,    setAlertOpen]    = useState(false)
  const [selectedId,   setSelectedId]   = useState<string | null>(null)
  const [polygonIds,   setPolygonIds]   = useState<string[] | null>(null)
  const [hasDrawnArea, setHasDrawnArea] = useState(false)

  // Derive everything from URL — Back restores all of it
  const sort          = searchParams.get('sort')  ?? 'score-desc'
  const page          = parseInt(searchParams.get('page') || '1')
  const isDark        = searchParams.get('dark') === '1'
  const view          = (searchParams.get('view') as 'all'|'map'|'list') ?? 'all'
  const activeFilters = useMemo(() => filtersFromParams(searchParams), [searchParams])

  // ── Load ALL markers once on mount ─────────────────────────────────────

  useEffect(() => {
    fetch('/api/all-markers')
      .then(r => r.json())
      .then((markers: MapMarker[]) => {
        setAllMarkers(markers)
        setMarkersReady(true)
      })
      .catch(() => setMarkersReady(true))
  }, [])

  // ── Client-side filtered markers ─────────────────────────────────────────

  // When no filters active, show ALL markers (no blank slate)
  const filteredMarkers = useMemo(() => {
    if (!markersReady) return []
    if (!hasActiveFilters(activeFilters) && (activeFilters.sources?.length ?? 3) === 3) {
      return allMarkers
    }
    return applyFiltersToMarkers(allMarkers, activeFilters)
  }, [allMarkers, markersReady, activeFilters])

  const displayedMarkers = useMemo(() => {
    if (polygonIds !== null) return filteredMarkers.filter(m => polygonIds.includes(m.id))
    return filteredMarkers
  }, [filteredMarkers, polygonIds])

  // ── URL sync ─────────────────────────────────────────────────────────────

  const pushUrl = useCallback((
    filters: FilterState,
    newPage = 1,
    newSort?: string,
    newDark?: boolean,
    newView?: string,
  ) => {
    const qs = buildQueryString(
      newPage,
      newSort ?? sort,
      filters,
      newDark ?? isDark,
      newView ?? view,
    )
    router.replace(`/?${qs}`)
  }, [sort, isDark, view, router])

  const handleFilterChange = useCallback((f: FilterState) => {
    pushUrl(f, 1)
  }, [pushUrl])

  const handleClearFilters = useCallback(() => {
    setPolygonIds(null)
    setHasDrawnArea(false)
    router.replace(`/?page=1&sort=${sort}${isDark ? '&dark=1' : ''}${view !== 'all' ? `&view=${view}` : ''}`)
  }, [sort, isDark, view, router])

  const handleDarkToggle = useCallback(() => {
    pushUrl(activeFilters, page, sort, !isDark, view)
  }, [activeFilters, page, sort, isDark, view, pushUrl])

  const handleViewChange = useCallback((newView: 'all'|'map'|'list') => {
    pushUrl(activeFilters, page, sort, isDark, newView)
  }, [activeFilters, page, sort, isDark, pushUrl])

  // ── Paginated listings (server, cards only) ───────────────────────────────

  useEffect(() => {
    if (!hasActiveFilters(activeFilters) && (activeFilters.sources?.length ?? 3) === 3) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const qs = buildQueryString(page, sort, activeFilters, isDark, view)
    fetch(`/api/listings?${qs}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [page, sort, activeFilters])

  // ── Event handlers ───────────────────────────────────────────────────────

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId(id)
    const panel = cardsPanelRef.current
    const card  = document.getElementById(`card-${id}`)
    if (panel && card) {
      const panelRect = panel.getBoundingClientRect()
      const cardRect  = card.getBoundingClientRect()
      const relativeTop = cardRect.top - panelRect.top + panel.scrollTop
      const target = relativeTop - (panelRect.height / 2) + (cardRect.height / 2)
      panel.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
    }
  }, [])

  const handlePolygonFilter = useCallback((ids: string[] | null) => {
    setPolygonIds(ids)
    setHasDrawnArea(ids !== null)
  }, [])

  const handleDrawArea  = useCallback(() => { (window as any).__dealradar_startDraw?.() }, [])
  const handleClearDraw = useCallback(() => {
    ;(window as any).__dealradar_clearDraw?.()
    setPolygonIds(null)
    setHasDrawnArea(false)
  }, [])

  const currentFilterQs = buildQueryString(page, sort, activeFilters, isDark, view)

  const handlePageChange = (newPage: number) => {
    router.replace(`/?${buildQueryString(newPage, sort, activeFilters, isDark, view)}`)
  }

  // ── Derived ──────────────────────────────────────────────────────────────

  const filtersActive = hasActiveFilters(activeFilters) || (activeFilters.sources?.length ?? 3) < 3

  const visibleListings = data?.listings.filter(l =>
    polygonIds === null || polygonIds.includes(l.listing_id)
  ) ?? []

  const resultCount    = polygonIds !== null ? polygonIds.length : (filtersActive ? (data?.total ?? 0) : allMarkers.length)
  const isMapHidden    = view === 'list'
  const isCardsHidden  = view === 'map'
  const isCardsExpanded = view === 'list'

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: isDark ? '#0f172a' : '#f8fafc' }}>
      <Nav
        view={view}
        onViewChange={handleViewChange}
        isDark={isDark}
        onDarkToggle={handleDarkToggle}
        onAlertOpen={() => setAlertOpen(true)}
        onLogoClick={() => { handleClearFilters(); handleViewChange('all') }}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <FilterSidebar
          isDark={isDark}
          onDrawArea={handleDrawArea}
          onClearDraw={handleClearDraw}
          hasDrawnArea={hasDrawnArea}
          filters={activeFilters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Map */}
        {!isMapHidden && (
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <ListingsMap
              markers={displayedMarkers}
              isDark={isDark}
              selectedId={selectedId}
              filterQs={currentFilterQs}
              onMarkerClick={handleMarkerClick}
              onPolygonFilter={handlePolygonFilter}
              allMarkersForPolygon={filteredMarkers}
            />
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
              color: '#e2e8f0', fontSize: 11, fontWeight: 600,
              padding: '5px 10px', borderRadius: 8, zIndex: 1000,
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              {!markersReady
                ? 'Loading…'
                : polygonIds !== null
                  ? `${polygonIds.length} in area`
                  : `${displayedMarkers.length} listings`
              }
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
              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                {!filtersActive
                  ? 'Select a filter to see listings'
                  : loading ? '…' : `${resultCount} ${polygonIds !== null ? 'in area' : 'listings'} · p.${page}/${data?.totalPages ?? 1}`
                }
              </span>
              <select value={sort}
                onChange={e => router.replace(`/?${buildQueryString(page, e.target.value, activeFilters, isDark, view)}`)}
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

            {/* No filter = prompt */}
            {!filtersActive && !loading && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: isDark ? '#334155' : '#cbd5e1',
                textAlign: 'center', padding: '32px 16px',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Select a filter to see listings</div>
                <div style={{ fontSize: 12 }}>Choose a region, price range, or room count to see cards here.</div>
                <div style={{ fontSize: 11, marginTop: 8, color: isDark ? '#1e3a5f' : '#e2e8f0' }}>
                  Map shows all {markersReady ? allMarkers.length : '…'} listings
                </div>
              </div>
            )}

            {/* Grid */}
            {filtersActive && (
              <div style={{
                display: 'grid', gap: 10,
                gridTemplateColumns: isCardsExpanded ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
              }}>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} style={{ height: 280, borderRadius: 12, background: isDark ? '#1e293b' : '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
                    ))
                  : visibleListings.map(l => (
                      <ListingCard
                        key={l.listing_id}
                        listing={l}
                        page={page}
                        filterQs={buildQueryString(page, sort, activeFilters, isDark, view)}
                        isDark={isDark}
                        isSelected={selectedId === l.listing_id}
                        onClick={() => handleMarkerClick(l.listing_id)}
                      />
                    ))
                }
              </div>
            )}

            {/* Pagination */}
            {filtersActive && data && !loading && (
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
