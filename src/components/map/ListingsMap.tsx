'use client'

import { useEffect, useRef, useState } from 'react'
import type { MapMarker } from '@/types/listing'
import { scoreColor } from '@/lib/utils'

interface ListingsMapProps {
  markers: MapMarker[]
  allMarkersForPolygon?: MapMarker[]   // full set for polygon hit-test (may differ from displayed markers)
  isDark: boolean
  selectedId: string | null
  onMarkerClick: (id: string) => void
  onPolygonFilter: (ids: string[] | null) => void
}

export function ListingsMap({ markers, allMarkersForPolygon, isDark, selectedId, onMarkerClick, onPolygonFilter }: ListingsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRefsRef = useRef<Record<string, any>>({})
  const drawnLayerRef = useRef<any>(null)
  const drawHandlerRef = useRef<any>(null)
  const LRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)

  const LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  const tileLayerRef = useRef<any>(null)

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    async function init() {
      const L = (await import('leaflet')).default
      await import('leaflet-draw')
      LRef.current = L

      const map = L.map(containerRef.current!, { zoomControl: false }).setView([56.946, 24.105], 13)
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      mapRef.current = map

      tileLayerRef.current = L.tileLayer(isDark ? DARK_TILES : LIGHT_TILES, {
        attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
      }).addTo(map)

      const drawnItems = new L.FeatureGroup()
      map.addLayer(drawnItems)
      drawnLayerRef.current = drawnItems

      map.on((L as any).Draw.Event.DRAWSTOP, () => {
        drawHandlerRef.current = null
      })

      // Signal that map is ready so the markers effect can run
      setMapReady(true)
    }

    init()
  }, [])

  // Render/update markers whenever markers data changes OR map becomes ready
  useEffect(() => {
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L) return

    // Remove stale markers
    Object.values(markerRefsRef.current).forEach((m: any) => map.removeLayer(m))
    markerRefsRef.current = {}

    markers.forEach(m => {
      const el = document.createElement('div')
      el.className = 'score-marker'
      el.style.background = scoreColor(m.score)
      el.textContent = m.score.toFixed(1)
      const icon = L.divIcon({ html: el.outerHTML, className: '', iconSize: [30, 30], iconAnchor: [15, 15] })
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map)

      // Mini card popup with photo + view button
      const photoHtml = m.photo
        ? `<img src="${m.photo}" alt="" style="width:100%;height:100px;object-fit:cover;border-radius:8px 8px 0 0;display:block;" onerror="this.style.display='none'" />`
        : `<div style="height:60px;background:#1e293b;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;font-size:18px;">🏠</div>`

      const popupHtml = `
        <div style="width:200px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;overflow:hidden;border-radius:8px;">
          ${photoHtml}
          <div style="padding:8px 10px 10px;">
            <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:1px;">${m.price}</div>
            <div style="font-size:11px;color:#64748b;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.addr}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:11px;font-weight:700;padding:2px 7px;border-radius:20px;color:white;background:${scoreColor(m.score)}">${m.score.toFixed(1)}</span>
              <a href="/listing/${m.id}" style="font-size:11px;font-weight:700;color:#6366f1;text-decoration:none;background:#eef2ff;border:1.5px solid #e0e7ff;padding:3px 9px;border-radius:7px;">View →</a>
            </div>
          </div>
        </div>`

      marker.bindPopup(popupHtml, { maxWidth: 220, minWidth: 200 })
      marker.on('click', () => onMarkerClick(m.id))
      markerRefsRef.current[m.id] = marker
    })

    // Re-wire polygon CREATED event — test against full set so polygon covers
    // all filtered listings, not just the current page's displayed markers
    const testSet = allMarkersForPolygon ?? markers
    const drawnItems = drawnLayerRef.current
    if (drawnItems) {
      map.off((L as any).Draw.Event.CREATED)
      map.on((L as any).Draw.Event.CREATED, (e: any) => {
        drawnItems.clearLayers()
        drawnItems.addLayer(e.layer)
        const verts = e.layer.getLatLngs()[0] as any[]
        const inside = testSet
          .filter(mk => pointInPoly(mk.lat, mk.lng, verts))
          .map(mk => mk.id)
        onPolygonFilter(inside)
      })
    }
  // mapReady is intentionally included so we run once the async init completes
  }, [markers, allMarkersForPolygon, onMarkerClick, onPolygonFilter, mapReady])

  // Swap tile layer on dark mode toggle
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current || !LRef.current) return
    const L = LRef.current
    mapRef.current.removeLayer(tileLayerRef.current)
    tileLayerRef.current = L.tileLayer(isDark ? DARK_TILES : LIGHT_TILES, {
      attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
    }).addTo(mapRef.current)
  }, [isDark])

  // Pan to + highlight selected marker
  useEffect(() => {
    if (!mapRef.current || !selectedId) return
    const marker = markerRefsRef.current[selectedId]
    if (marker) {
      mapRef.current.panTo(marker.getLatLng(), { animate: true })
      marker.openPopup()
    }
  }, [selectedId])

  // Expose draw controls to FilterSidebar via window
  useEffect(() => {
    ;(window as any).__dealradar_startDraw = () => {
      if (!mapRef.current || !LRef.current) return
      const L = LRef.current
      if (drawHandlerRef.current) { drawHandlerRef.current.disable(); drawHandlerRef.current = null }
      drawnLayerRef.current?.clearLayers()
      const handler = new (L as any).Draw.Polygon(mapRef.current, {
        shapeOptions: { color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.08, weight: 2 },
        showArea: true, metric: true,
      })
      handler.enable()
      drawHandlerRef.current = handler
    }

    ;(window as any).__dealradar_clearDraw = () => {
      if (!mapRef.current) return
      drawnLayerRef.current?.clearLayers()
      drawHandlerRef.current?.disable()
      drawHandlerRef.current = null
      Object.values(markerRefsRef.current).forEach((m: any) => m.setOpacity(1))
      onPolygonFilter(null)
    }
  }, [onPolygonFilter])

  return (
    <div
      id="map-panel"
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  )
}

function pointInPoly(px: number, py: number, verts: any[]): boolean {
  let inside = false
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const xi = verts[i].lat, yi = verts[i].lng
    const xj = verts[j].lat, yj = verts[j].lng
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}
