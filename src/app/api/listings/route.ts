import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import type { Listing, MapMarker, PaginatedListings } from '@/types/listing'

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams
  const page    = Math.max(1, parseInt(sp.get('page') || '1'))
  const perPage = 20
  const offset  = (page - 1) * perPage

  // Source filter — comma-separated or repeated: sscom,city24,izsoles
  const sourcesParam = sp.getAll('source')
  const sources: string[] = sourcesParam.length > 0
    ? sourcesParam.flatMap(s => s.split(','))
    : ['sscom', 'city24', 'izsoles']

  const sortMap: Record<string, string> = {
    'price-asc':  'price_eur ASC NULLS LAST',
    'price-desc': 'price_eur DESC NULLS LAST',
    'ppm2-asc':   'price_m2 ASC NULLS LAST',
    'ppm2-desc':  'price_m2 DESC NULLS LAST',
    'date-desc':  'date_listed DESC NULLS LAST',
    'date-asc':   'date_listed ASC NULLS LAST',
    'score-desc': 'price_m2 ASC NULLS LAST',  // no AI score yet — proxy with cheapest/m²
  }
  const sort = sortMap[sp.get('sort') || 'date-desc'] || sortMap['date-desc']

  // Filter params
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

  // Source filter
  clauses.push(`source = ANY(${p(sources)})`)

  if (district) clauses.push(`district ILIKE ${p('%' + district + '%')}`)
  if (street)   clauses.push(`street_name ILIKE ${p('%' + street + '%')}`)

  // Price: use price_eur for sale, start_price_eur for auctions
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
    const [countRes, listingsRes] = await Promise.all([
      client.query(`SELECT COUNT(*) as cnt FROM unified_listings WHERE ${where}`, params),
      client.query(`
        SELECT
          u.source,
          u.id           AS listing_id,
          u.source_url   AS url,
          COALESCE(u.price_eur, u.start_price_eur) AS price_eur,
          u.area_m2,
          u.price_m2,
          u.rooms,
          u.floor,
          u.total_floors,
          u.has_lift,
          u.district,
          u.street_name  AS street,
          u.house_number,
          u.latitude,
          u.longitude,
          u.date_listed  AS published_at,
          u.listing_type,
          u.start_price_eur,
          u.auction_state,
          u.auction_stage,
          -- Deal score only for sscom listings that have analysis
          la.deal_score,
          -- Thumbnail photo
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
        WHERE ${where}
        ORDER BY ${sort}
        LIMIT ${p(perPage)} OFFSET ${p(offset)}
      `, params),
    ])

    const total = parseInt(countRes.rows[0].cnt)
    const listings: Listing[] = listingsRes.rows.map((r: any) => ({
      ...r,
      price_eur:    r.price_eur    != null ? parseFloat(r.price_eur)    : null,
      area_m2:      r.area_m2      != null ? parseFloat(r.area_m2)      : null,
      price_m2:     r.price_m2     != null ? parseFloat(r.price_m2)     : null,
      deal_score:   r.deal_score   != null ? parseFloat(r.deal_score)   : null,
      latitude:     r.latitude     != null ? parseFloat(r.latitude)     : null,
      longitude:    r.longitude    != null ? parseFloat(r.longitude)    : null,
      rooms:        r.rooms        != null ? parseInt(r.rooms)          : null,
      floor:        r.floor        != null ? parseInt(r.floor)          : null,
      total_floors: r.total_floors != null ? parseInt(r.total_floors)   : null,
      start_price_eur: r.start_price_eur != null ? parseFloat(r.start_price_eur) : null,
    }))

    const markers: MapMarker[] = listings
      .filter(l => l.latitude && l.longitude)
      .map(l => ({
        id:     l.listing_id,
        lat:    l.latitude!,
        lng:    l.longitude!,
        score:  l.deal_score || 0,
        price:  l.price_eur ? formatPrice(l.price_eur) : (l as any).start_price_eur ? formatPrice((l as any).start_price_eur) : '?',
        addr:   [l.street, l.house_number].filter(Boolean).join(' ') || l.district || 'Latvia',
        photo:  l.photo_url || null,
        source: (l as any).source,
      }))

    const result: PaginatedListings = {
      listings, total, page, perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      markers
    }
    return NextResponse.json(result)
  } finally {
    client.release()
  }
}
