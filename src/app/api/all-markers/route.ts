import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { MapMarker } from '@/types/listing'

export async function GET() {
  const client = await pool.connect()
  try {
    const res = await client.query(`
      SELECT
        u.source,
        u.id AS listing_id,
        COALESCE(u.price_eur, u.start_price_eur) AS price_eur,
        u.area_m2,
        u.price_m2,
        u.rooms,
        u.floor,
        u.total_floors,
        u.has_lift,
        u.district,
        u.street_name AS street,
        u.house_number,
        u.latitude,
        u.longitude,
        la.deal_score,
        CASE
          WHEN u.source = 'sscom' THEN (
            SELECT photo_url FROM listing_photos lp WHERE lp.listing_id = u.id LIMIT 1
          )
          WHEN u.source = 'city24' THEN (
            SELECT photo_url FROM city24_photos cp WHERE cp.listing_id = u.id LIMIT 1
          )
          WHEN u.source = 'izsoles' THEN (
            SELECT photo_url FROM izsoles_photos ip WHERE ip.auction_uuid = u.id LIMIT 1
          )
        END AS photo_url
      FROM unified_listings u
      LEFT JOIN listing_analysis la ON u.source = 'sscom' AND u.id = la.listing_id
      WHERE u.latitude IS NOT NULL
      ORDER BY la.deal_score DESC NULLS LAST
    `)

    const markers: MapMarker[] = res.rows.map((r: any) => ({
      id: r.listing_id,
      lat: parseFloat(r.latitude),
      lng: parseFloat(r.longitude),
      score: r.deal_score != null ? parseFloat(r.deal_score) : 0,
      price: r.price_eur ? parseFloat(r.price_eur) : 0, // raw number for filtering
      price_formatted: r.price_eur ? new Intl.NumberFormat('lv-LV').format(Math.round(r.price_eur)) + '€' : '?',
      addr: [r.street, r.house_number].filter(Boolean).join(' ') || r.district || 'Riga',
      photo: r.photo_url || null,
      source: r.source,
      area_m2: r.area_m2 != null ? parseFloat(r.area_m2) : null,
      rooms: r.rooms != null ? parseInt(r.rooms) : null,
      floor: r.floor != null ? parseInt(r.floor) : null,
      total_floors: r.total_floors != null ? parseInt(r.total_floors) : null,
      has_lift: r.has_lift || false,
      district: r.district || '',
      street: r.street || '',
    }))

    return NextResponse.json(markers, {
      headers: { 'Cache-Control': 'public, max-age=300' }
    })
  } finally {
    client.release()
  }
}
