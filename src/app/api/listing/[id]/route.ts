import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const source = new URL(req.url).searchParams.get('source') || 'sscom'
  const client = await pool.connect()

  try {
    if (source === 'city24') {
      const [listingRes, photosRes] = await Promise.all([
        client.query(`
          SELECT
            listing_id        AS listing_id,
            'city24'          AS source,
            source_url        AS url,
            price_eur,
            price_per_m2      AS price_m2,
            area_m2,
            rooms,
            floor,
            total_floors,
            has_lift,
            district,
            source_street     AS street,
            source_house_number AS house_number,
            city_name         AS city,
            COALESCE(geocoded_latitude, source_latitude)   AS latitude,
            COALESCE(geocoded_longitude, source_longitude) AS longitude,
            date_published    AS published_at,
            listing_type,
            year_built,
            building_material AS building_type,
            condition_type,
            house_type,
            NULL::text        AS description,
            NULL::numeric     AS deal_score,
            NULL::numeric     AS roi_pct
          FROM city24_listings
          WHERE listing_id = $1
        `, [id]),
        client.query('SELECT photo_url FROM city24_photos WHERE listing_id = $1', [id])
      ])

      if (listingRes.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      const raw = listingRes.rows[0]
      return NextResponse.json({
        ...raw,
        price_eur:    raw.price_eur    != null ? parseFloat(raw.price_eur)   : null,
        price_m2:     raw.price_m2     != null ? parseFloat(raw.price_m2)    : null,
        area_m2:      raw.area_m2      != null ? parseFloat(raw.area_m2)     : null,
        latitude:     raw.latitude     != null ? parseFloat(raw.latitude)    : null,
        longitude:    raw.longitude    != null ? parseFloat(raw.longitude)   : null,
        rooms:        raw.rooms        != null ? parseInt(raw.rooms)         : null,
        floor:        raw.floor        != null ? parseInt(raw.floor)         : null,
        total_floors: raw.total_floors != null ? parseInt(raw.total_floors)  : null,
        photos: photosRes.rows.map((r: any) => r.photo_url),
      })
    }

    if (source === 'izsoles') {
      const [listingRes, photosRes] = await Promise.all([
        client.query(`
          SELECT
            auction_uuid      AS listing_id,
            'izsoles'         AS source,
            source_url        AS url,
            start_price_eur   AS price_eur,
            NULL::numeric     AS price_m2,
            area_m2,
            rooms,
            floor,
            total_floors,
            NULL::boolean     AS has_lift,
            city              AS district,
            address_raw       AS street,
            NULL::text        AS house_number,
            city,
            geocoded_latitude  AS latitude,
            geocoded_longitude AS longitude,
            auction_start     AS published_at,
            'auction'         AS listing_type,
            year_built,
            NULL::text        AS building_type,
            auction_state,
            auction_stage,
            valuation_eur,
            bid_step_eur,
            start_price_eur,
            description_text  AS description,
            auction_end,
            NULL::numeric     AS deal_score,
            NULL::numeric     AS roi_pct
          FROM izsoles_listings
          WHERE auction_uuid = $1
        `, [id]),
        client.query('SELECT photo_url FROM izsoles_photos WHERE auction_uuid = $1', [id])
      ])

      if (listingRes.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      const raw = listingRes.rows[0]
      return NextResponse.json({
        ...raw,
        price_eur:    raw.price_eur    != null ? parseFloat(raw.price_eur)   : null,
        area_m2:      raw.area_m2      != null ? parseFloat(raw.area_m2)     : null,
        latitude:     raw.latitude     != null ? parseFloat(raw.latitude)    : null,
        longitude:    raw.longitude    != null ? parseFloat(raw.longitude)   : null,
        rooms:        raw.rooms        != null ? parseInt(raw.rooms)         : null,
        floor:        raw.floor        != null ? parseInt(raw.floor)         : null,
        total_floors: raw.total_floors != null ? parseInt(raw.total_floors)  : null,
        photos: photosRes.rows.map((r: any) => r.photo_url),
      })
    }

    // Default: SS.com
    const [listingRes, photosRes] = await Promise.all([
      client.query(`
        SELECT l.*,
               'sscom'                                              AS source,
               ROUND(l.price_eur/l.area_m2)                        AS price_m2,
               l.source_street                                      AS street,
               l.source_house_number                               AS house_number,
               l.source_apartment_number                           AS apartment_number,
               l.source_building_type                              AS building_type,
               COALESCE(l.geocoded_latitude, l.source_latitude)    AS latitude,
               COALESCE(l.geocoded_longitude, l.source_longitude)  AS longitude,
               la.deal_score, la.analyst_notes, la.renovation_potential,
               la.comp_avg_price_m2, la.comp_count,
               la.reno_cost_estimate, la.roi_reno, la.roi_quick_flip, la.roi_massive,
               la.estimated_roi, la.elevator, la.parking, la.heating,
               la.red_flags, la.photo_assessment, la.filter_tags,
               la.roi_reno AS roi_pct
        FROM listings l
        LEFT JOIN listing_analysis la ON l.listing_id = la.listing_id
        WHERE l.listing_id = $1
      `, [id]),
      client.query('SELECT photo_url FROM listing_photos WHERE listing_id = $1', [id])
    ])

    if (listingRes.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const raw = listingRes.rows[0]
    return NextResponse.json({
      ...raw,
      price_eur:         raw.price_eur         != null ? parseFloat(raw.price_eur)         : null,
      area_m2:           raw.area_m2           != null ? parseFloat(raw.area_m2)           : null,
      price_m2:          raw.price_m2          != null ? parseFloat(raw.price_m2)          : null,
      deal_score:        raw.deal_score        != null ? parseFloat(raw.deal_score)        : null,
      roi_reno:          raw.roi_reno          != null ? parseFloat(raw.roi_reno)          : null,
      roi_quick_flip:    raw.roi_quick_flip    != null ? parseFloat(raw.roi_quick_flip)    : null,
      roi_massive:       raw.roi_massive       != null ? parseFloat(raw.roi_massive)       : null,
      reno_cost_estimate:raw.reno_cost_estimate!= null ? parseFloat(raw.reno_cost_estimate): null,
      comp_avg_price_m2: raw.comp_avg_price_m2 != null ? parseFloat(raw.comp_avg_price_m2) : null,
      latitude:          raw.latitude          != null ? parseFloat(raw.latitude)          : null,
      longitude:         raw.longitude         != null ? parseFloat(raw.longitude)         : null,
      rooms:             raw.rooms             != null ? parseInt(raw.rooms)               : null,
      floor:             raw.floor             != null ? parseInt(raw.floor)               : null,
      total_floors:      raw.total_floors      != null ? parseInt(raw.total_floors)        : null,
      comp_count:        raw.comp_count        != null ? parseInt(raw.comp_count)          : null,
      photos: photosRes.rows.map((r: any) => r.photo_url),
    })
  } finally {
    client.release()
  }
}
