import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ListingDetail } from '@/types/listing'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const client = await pool.connect()
  try {
    const [listingRes, photosRes] = await Promise.all([
      client.query(`
        SELECT l.*,
               ROUND(l.price_eur/l.area_m2) as price_m2,
               la.deal_score, la.analyst_notes, la.renovation_potential,
               la.price_per_m2, la.comp_avg_price_m2, la.comp_count,
               la.reno_cost_estimate, la.roi_reno, la.roi_quick_flip, la.roi_massive,
               la.estimated_roi, la.elevator, la.parking, la.heating,
               la.red_flags, la.photo_assessment, la.filter_tags,
               la.roi_reno as roi_pct
        FROM listings l
        LEFT JOIN listing_analysis la ON l.listing_id = la.listing_id
        WHERE l.listing_id = $1
      `, [id]),
      client.query(
        'SELECT photo_url FROM listing_photos WHERE listing_id = $1',
        [id]
      )
    ])

    if (listingRes.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const raw = listingRes.rows[0]
    // pg returns numeric/decimal columns as strings — coerce to JS numbers
    const listing: ListingDetail = {
      ...raw,
      price_eur: parseFloat(raw.price_eur),
      area_m2: parseFloat(raw.area_m2),
      price_m2: parseFloat(raw.price_m2),
      deal_score: raw.deal_score != null ? parseFloat(raw.deal_score) : null,
      roi_reno: raw.roi_reno != null ? parseFloat(raw.roi_reno) : null,
      roi_quick_flip: raw.roi_quick_flip != null ? parseFloat(raw.roi_quick_flip) : null,
      roi_massive: raw.roi_massive != null ? parseFloat(raw.roi_massive) : null,
      reno_cost_estimate: raw.reno_cost_estimate != null ? parseFloat(raw.reno_cost_estimate) : null,
      comp_avg_price_m2: raw.comp_avg_price_m2 != null ? parseFloat(raw.comp_avg_price_m2) : null,
      latitude: raw.latitude != null ? parseFloat(raw.latitude) : null,
      longitude: raw.longitude != null ? parseFloat(raw.longitude) : null,
      rooms: raw.rooms != null ? parseInt(raw.rooms) : null,
      floor: raw.floor != null ? parseInt(raw.floor) : null,
      total_floors: raw.total_floors != null ? parseInt(raw.total_floors) : null,
      comp_count: raw.comp_count != null ? parseInt(raw.comp_count) : null,
      photos: photosRes.rows.map((r: { photo_url: string }) => r.photo_url),
    }

    return NextResponse.json(listing)
  } finally {
    client.release()
  }
}
