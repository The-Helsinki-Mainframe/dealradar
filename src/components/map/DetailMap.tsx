'use client'

import { useEffect, useRef } from 'react'

interface DetailMapProps {
  lat: number
  lng: number
  addr: string
  price: string
}

export function DetailMap({ lat, lng, addr, price }: DetailMapProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!ref.current || mapRef.current) return
    async function init() {
      const L = (await import('leaflet')).default

      const map = L.map(ref.current!, { zoomControl: true }).setView([lat, lng], 16)
      mapRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO', maxZoom: 19
      }).addTo(map)

      const icon = L.divIcon({
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#6366f1;border:3px solid white;box-shadow:0 2px 8px rgba(99,102,241,0.5);"></div>',
        className: '', iconSize: [14, 14], iconAnchor: [7, 7],
      })

      L.marker([lat, lng], { icon }).addTo(map)
        .bindPopup(`<b>${addr}</b><br>${price}`)
        .openPopup()
    }
    init()
  }, [])

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />
}
