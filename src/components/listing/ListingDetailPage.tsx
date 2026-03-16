'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { formatPrice, scoreColor, scoreLabel, buildingBadge, daysAgo } from '@/lib/utils'
import type { ListingDetail } from '@/types/listing'

const DetailMap = dynamic(() => import('@/components/map/DetailMap').then(m => m.DetailMap), { ssr: false })

interface ListingDetailPageProps {
  id: string
}

export function ListingDetailPage({ id }: ListingDetailPageProps) {
  const searchParams = useSearchParams()
  const backPage = searchParams.get('back_page') || '1'
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhoto, setCurrentPhoto] = useState(0)

  useEffect(() => {
    fetch(`/api/listing/${id}`)
      .then(r => r.json())
      .then(d => { setListing(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', color: '#94a3b8', fontSize: 14 }}>
      Loading…
    </div>
  )
  if (!listing) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', color: '#94a3b8', fontSize: 14 }}>
      Listing not found.
    </div>
  )

  const l = listing
  const sc = scoreColor(l.deal_score)
  const sl = scoreLabel(l.deal_score)
  const bb = buildingBadge(l.building_type)
  const addr = [l.street, l.house_number].filter(Boolean).join(' ') || l.district || 'Riga'
  const photos = l.photos || []
  const photoCount = photos.length

  function prevPhoto() { setCurrentPhoto(i => (i - 1 + photoCount) % photoCount) }
  function nextPhoto() { setCurrentPhoto(i => (i + 1) % photoCount) }

  // Description: extract English part from bilingual text
  let desc = l.description || ''
  const engIdx = desc.indexOf('A unique apartment') > 0 ? desc.indexOf('A unique apartment')
    : desc.indexOf('This apartment') > 0 ? desc.indexOf('This apartment')
    : desc.indexOf('The building') > 0 ? desc.indexOf('The building') : -1
  if (engIdx > 0) {
    const ruIdx = desc.indexOf('Предлагается', engIdx)
    desc = desc.slice(engIdx, ruIdx > 0 ? ruIdx : undefined).trim()
  } else {
    desc = desc.slice(0, 600)
  }

  const statBox = (label: string, value: string, positive?: boolean) => (
    <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2, color: positive === undefined ? '#0f172a' : positive ? '#16a34a' : '#dc2626' }}>
        {value}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, Inter, Segoe UI, sans-serif' }}>
      {/* Nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/?page=${backPage}`} style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            ← Back to listings
          </Link>
          <div style={{ width: 1, height: 16, background: '#e2e8f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white' }}>D</div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>DealRadar</span>
          </div>
          <div style={{ flex: 1 }} />
          <a href={l.url} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', textDecoration: 'none', border: '1.5px solid #e2e8f0', padding: '6px 12px', borderRadius: 9 }}>
            View on ss.com ↗
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Gallery */}
            <div id="gallery-section" style={{ background: '#0f172a', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
              <div id="gallery-main" style={{ position: 'relative', height: 420 }}>
                {photos.length > 0 ? (
                  <img
                    src={photos[currentPhoto]}
                    alt={addr}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x500/0f172a/475569?text=No+photo' }}
                  />
                ) : (
                  <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>No photos</div>
                )}
                {photos.length > 1 && (
                  <>
                    <button onClick={prevPhoto} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>‹</button>
                    <button onClick={nextPhoto} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>›</button>
                    <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>
                      {currentPhoto + 1} / {photoCount}
                    </div>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              <div style={{ display: 'flex', gap: 6, padding: '8px 10px', overflowX: 'auto', background: '#0f172a' }}>
                {photos.slice(0, 12).map((p, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    style={{ width: 58, height: 44, borderRadius: 6, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, border: `2px solid ${i === currentPhoto ? '#6366f1' : 'transparent'}` }}
                  >
                    <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Header */}
            <div id="listing-header" style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h1 id="listing-title" style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{addr}</h1>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontSize: 13, color: '#64748b' }}>
                    <span>{l.district || 'Riga'}</span>
                    {bb && <><span style={{ color: '#e2e8f0' }}>·</span><span>{bb}</span></>}
                    <span style={{ color: '#e2e8f0' }}>·</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{daysAgo(l.published_at ? new Date(l.published_at) : null)}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a' }}>{l.price_eur != null ? formatPrice(l.price_eur) : '—'}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>{l.price_m2 != null ? `€${Math.round(l.price_m2)}/m²` : ''}</div>
                </div>
              </div>
              <div id="listing-specs" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {[
                  `🛏 ${l.rooms} rooms`,
                  `📐 ${l.area_m2} m²`,
                  l.floor && l.total_floors ? `🏢 Floor ${l.floor} of ${l.total_floors}` : null,
                  l.has_lift ? '🛗 Lift' : null,
                  l.parking ? '🚗 Parking' : null,
                  `🔥 ${(l.heating || 'central')} heating`,
                ].filter(Boolean).map(spec => (
                  <span key={spec} style={{ background: spec!.includes('Lift') || spec!.includes('Park') ? '#f0fdf4' : '#f1f5f9', color: spec!.includes('Lift') || spec!.includes('Park') ? '#16a34a' : '#475569', fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 8 }}>
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div id="listing-description" style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Description</h2>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                {desc.split('\n').map((line, i) => <p key={i} style={{ marginBottom: 8 }}>{line}</p>)}
              </div>
              <a href={l.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                View full listing on ss.com ↗
              </a>
            </div>

            {/* Map */}
            <div id="listing-map-section" style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Location</h2>
              {l.latitude && l.longitude && (
                <div style={{ height: 240, borderRadius: 12, overflow: 'hidden' }}>
                  <DetailMap lat={l.latitude} lng={l.longitude} addr={addr} price={l.price_eur != null ? formatPrice(l.price_eur) : "—"} />
                </div>
              )}
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Exact position may vary slightly.</p>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ position: 'sticky', top: 80 }}>
            {/* Deal score */}
            <div id="score-section" style={{ background: 'white', border: '2px solid #f1f5f9', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deal Score</span>
                <span style={{ fontSize: 10, background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: 5, fontWeight: 600 }}>Phase 2</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: sc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: 'white' }}>
                  {l.deal_score?.toFixed(1) || '—'}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{sl}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>out of 10</div>
                </div>
              </div>
              {l.analyst_notes && (
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                  {l.analyst_notes.slice(0, 300)}{l.analyst_notes.length > 300 ? '…' : ''}
                </div>
              )}
            </div>

            {/* ROI */}
            <div id="roi-section" style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>ROI Calculator</h2>
                <span style={{ fontSize: 10, background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: 5, fontWeight: 600 }}>Phase 2</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {statBox('Reno & sell', l.roi_reno ? `${l.roi_reno.toFixed(0)}%` : '—', l.roi_reno ? l.roi_reno > 0 : undefined)}
                {statBox('Quick flip', l.roi_quick_flip ? `${l.roi_quick_flip.toFixed(0)}%` : '—', l.roi_quick_flip ? l.roi_quick_flip > 0 : undefined)}
                {statBox('Full gut ROI', l.roi_massive ? `${l.roi_massive.toFixed(0)}%` : '—', l.roi_massive ? l.roi_massive > 0 : undefined)}
                {statBox('Reno cost est.', l.reno_cost_estimate ? `€${Math.round(l.reno_cost_estimate).toLocaleString()}` : '—')}
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Comp data ({l.comp_count || 0} sales within 300m)
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#6366f1' }}>
                  {l.comp_avg_price_m2 ? `€${Math.round(l.comp_avg_price_m2)}/m²` : '—'}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Average sold price/m² nearby</div>
              </div>
            </div>

            {/* VZD */}
            <div id="vzd-section" style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Historic Sales (VZD)</h2>
                <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 5, fontWeight: 600 }}>Phase 1</span>
              </div>
              <div style={{ background: '#f8fafc', border: '1.5px dashed #e2e8f0', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>🏛️</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>VZD transaction data coming in Phase 1</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Actual sold prices within 300–500m, past 2 years</div>
              </div>
            </div>

            {/* Rental yield */}
            <div id="rental-section" style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Rental Yield</h2>
                <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 5, fontWeight: 600 }}>Phase 2</span>
              </div>
              <div style={{ background: '#f8fafc', border: '1.5px dashed #e2e8f0', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>📊</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Rental rate data coming in Phase 2</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Estimated monthly income and gross yield % for this area</div>
              </div>
            </div>

            {/* CTA */}
            <div id="cta-section" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: 16, padding: '20px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 6 }}>Get alerts like this</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>Be first to know when similar listings appear in this area.</p>
              <Link href="/" style={{ display: 'block', textAlign: 'center', background: 'white', color: '#6366f1', fontSize: 13, fontWeight: 700, borderRadius: 10, padding: 10, textDecoration: 'none' }}>
                🔔 Set up an alert
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
