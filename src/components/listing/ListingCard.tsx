'use client'

import { formatPrice, scoreColor, scoreLabel, buildingBadge, daysAgo } from '@/lib/utils'
import type { Listing } from '@/types/listing'
import Link from 'next/link'

interface ListingCardProps {
  listing: Listing
  page: number
  filterQs: string   // full filter query string — restored on Back
  isDark: boolean
  isSelected: boolean
  onClick: () => void
}

export function ListingCard({ listing: l, page, filterQs, isDark, isSelected, onClick }: ListingCardProps) {
  const sc = scoreColor(l.deal_score)
  const sl = scoreLabel(l.deal_score)
  const bb = buildingBadge(l.building_type)
  const da = daysAgo(l.published_at ? new Date(l.published_at) : null)
  const photo = l.photo_url || 'https://placehold.co/600x400/f1f5f9/94a3b8?text=No+photo'
  const addr = [l.street, l.house_number].filter(Boolean).join(' ') || l.district || 'Riga'
  const floorStr = l.floor && l.total_floors ? `Floor ${l.floor}/${l.total_floors}` : ''

  return (
    <div
      id={`card-${l.listing_id}`}
      data-listing-id={l.listing_id}
      onClick={onClick}
      className="listing-card rounded-xl overflow-hidden border cursor-pointer group transition-all"
      style={{
        background: isDark ? '#1e293b' : 'white',
        borderColor: isSelected ? '#6366f1' : isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
        boxShadow: isSelected ? '0 0 0 2px rgba(99,102,241,0.3)' : undefined,
      }}
    >
      {/* Photo */}
      <div id={`card-photo-${l.listing_id}`} className="relative overflow-hidden" style={{ height: 160 }}>
        <img
          src={photo}
          alt={addr}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=No+photo'
          }}
        />
        {/* Score badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
            style={{ background: sc }}
          >
            {sl} <span className="opacity-60 font-normal text-[9px]">P2</span>
          </span>
          {bb && (
            <span className="text-[10px] font-medium bg-black/40 text-white px-2 py-0.5 rounded-full">
              {bb}
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2">
          {l.source === 'izsoles' ? (
            <span className="text-[10px] bg-amber-500/90 backdrop-blur-sm text-white font-bold px-2 py-0.5 rounded-full">
              ⚖️ Auction
            </span>
          ) : l.source === 'city24' ? (
            <span className="text-[10px] bg-blue-500/90 backdrop-blur-sm text-white font-medium px-2 py-0.5 rounded-full">
              city24
            </span>
          ) : (
            <span className="text-[10px] bg-white/80 backdrop-blur-sm text-gray-500 font-medium px-2 py-0.5 rounded-full">
              ss.com
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div id={`card-body-${l.listing_id}`} className="p-3">
        <div id={`card-price-${l.listing_id}`} className="text-lg font-extrabold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
          {l.source === 'izsoles' && l.start_price_eur
            ? <span>Start {formatPrice(l.start_price_eur)}</span>
            : l.price_eur ? formatPrice(l.price_eur) : '—'
          }
        </div>
        <div id={`card-ppm2-${l.listing_id}`} className="text-[11px]" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
          {l.price_m2 ? `€${Math.round(l.price_m2)}/m²` : l.auction_stage ? `Stage ${l.auction_stage}` : ''}
        </div>
        <div id={`card-address-${l.listing_id}`} className="text-xs mt-1 truncate" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
          {addr}
        </div>
        <div id={`card-specs-${l.listing_id}`} className="flex flex-wrap gap-x-2 gap-y-0.5 mt-2 text-[11px]" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
          <span>{l.rooms} rooms</span>
          <span>·</span>
          <span>{l.area_m2}m²</span>
          {floorStr && <><span>·</span><span>{floorStr}</span></>}
          {l.has_lift && <><span>·</span><span className="text-emerald-500 font-medium">Lift</span></>}
        </div>
      </div>

      {/* Footer */}
      <div id={`card-footer-${l.listing_id}`} className="px-3 pb-3 flex items-center justify-between">
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
            color: isDark ? '#475569' : '#94a3b8',
          }}
        >
          {l.district || 'Riga'}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px]" style={{ color: isDark ? '#334155' : '#cbd5e1' }}>{da}</span>
          <Link
            href={`/listing/${l.listing_id}?back=${encodeURIComponent(filterQs)}&source=${l.source || 'sscom'}`}
            id={`card-view-${l.listing_id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] font-bold px-2 py-1 rounded-md transition-all"
            style={{
              color: '#6366f1',
              background: '#eef2ff',
              border: '1.5px solid #e0e7ff',
            }}
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  )
}
