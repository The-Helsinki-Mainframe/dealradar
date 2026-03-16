import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import type { MapMarker } from '@/types/listing'

// Returns ALL markers matching current filters — no pagination.
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams

  const sourcesParam = sp.getAll('source')
  const sources: string[] = sourcesParam.length > 0
    ? sourcesParam.flatMap(s => s.split(','))
    : ['sscom', 'city24']

  const district = sp.get('district') || ''
  const street   = sp.get('street')   || ''
  const priceMin = sp.get('priceMin') ? parseFloat(sp.get('priceMin')!) : null
  const priceMax = sp.get('priceMax') ? parseFloat(sp.get('priceMax')!) : null
  const ppm2Min  = sp.get('ppm2Min')  ? parseFloat(sp.get('ppm2Min')!)  : null
  const ppm2Max  = sp.get('ppm2Max')  ? parseFloat(sp.get('ppm2Max')!)  : null
  const sizeMin  = sp.get('sizeMin')  ? parseFloat(sp.get('sizeMin')!)  : null
  const sizeMax  = sp.get('sizeMax')  ? parseFloat(sp.get('sizeMax')!)  : null
  const rooms    = sp.getAll('rooms')
  const floors   = sp.getAll('floors')
  const hasLift  = sp.get('hasLift') === '1'

  const params: any[] = []
  const clauses: string[] = ['latitude IS NOT NULL']
  function p(val: any) { params.push(val); return `$${params.length}` }

  clauses.push(`source = ANY(${p(sources)})`)

  if (district) clauses.push(`district ILIKE ${p('%' + district + '%')}`)
  if (street)   clauses.push(`street_name ILIKE ${p('%' + street + '%')}`)
  if (priceMin !== null) clauses.push(`COALESCE(price_eur, start_price_eur) >= ${p(priceMin)}`)
  if (priceMax !== null) clauses.push(`COALESCE(price_eur, start_price_eur) <= ${p(priceMax)}`)
  if (ppm2Min  !== null) clauses.push(`price_m2 >= ${p(ppm2Min)}`)
  if (ppm2Max  !== null) clauses.push(`price_m2 <= ${p(ppm2Max)}`)
  if (sizeMin  !== null) clauses.push(`area_m2 >= ${p(sizeMin)}`)
  if (sizeMax  !== null) clauses.push(`area_m2 <= ${p(sizeMax)}`)
  if (hasLift)  clauses.push(`has_lift = true`)

  if (rooms.length > 0) {
    const rc: string[] = []
    for (const r of rooms) {
      if (r === 'Studio') rc.push(`(rooms = 0 OR rooms IS NULL)`)
      else if (r === '5+') rc.push(`rooms >= 5`)
      else rc.push(`rooms = ${p(parseInt(r))}`)
    }
    clauses.push(`(${rc.join(' OR ')})`)
  }

  if (floors.length > 0) {
    const fc: string[] = []
    for (const f of floors) {
      if (f === '6+') fc.push(`floor >= 6`)
      else if (f === 'Top') fc.push(`floor = total_floors`)
      else fc.push(`floor = ${p(parseInt(f))}`)
    }
    clauses.push(`(${fc.join(' OR ')})`)
  }

  const where = clauses.join(' AND ')
  const client = await pool.connect()
  try {
    const res = await client.query(`
      SELECT
        u.source,
        u.id AS listing_id,
        COALESCE(u.price_eur, u.start_price_eur) AS price_eur,
        u.latitude,
        u.longitude,
        u.street_name AS street,
        u.house_number,
        u.district,
        la.deal_score,
        CASE
          WHEN u.source = 'sscom'    THEN (SELECT photo_url FROM listing_photos lp WHERE lp.listing_id = u.id LIMIT 1)
          WHEN u.source = 'city24'   THEN (SELECT photo_url FROM city24_photos cp WHERE cp.listing_id = u.id LIMIT 1)
          WHEN u.source = 'izsoles'  THEN (SELECT photo_url FROM izsoles_photos ip WHERE ip.auction_uuid = u.id LIMIT 1)
        END AS photo_url
      FROM unified_listings u
      LEFT JOIN listing_analysis la ON u.source = 'sscom' AND u.id = la.listing_id
      WHERE ${where}
      ORDER BY la.deal_score DESC NULLS LAST
    `, params)

    const markers: MapMarker[] = res.rows.map((r: any) => ({
      id:     r.listing_id,
      lat:    parseFloat(r.latitude),
      lng:    parseFloat(r.longitude),
      score:  r.deal_score != null ? parseFloat(r.deal_score) : 0,
      price:  r.price_eur ? formatPrice(parseFloat(r.price_eur)) : '?',
      addr:   [r.street, r.house_number].filter(Boolean).join(' ') || r.district || 'Latvia',
      photo:  r.photo_url || null,
      source: r.source,
    }))

    return NextResponse.json(markers)
  } finally {
    client.release()
  }
}
