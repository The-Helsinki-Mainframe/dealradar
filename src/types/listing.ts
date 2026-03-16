export interface Listing {
  listing_id: string
  source: 'sscom' | 'city24' | 'izsoles'
  price_eur: number | null
  area_m2: number | null
  rooms: number | null
  district: string | null
  price_m2: number | null
  street: string | null
  house_number: string | null
  floor: number | null
  total_floors: number | null
  has_lift: boolean | null
  building_type: string | null
  latitude: number | null
  longitude: number | null
  published_at: string | null
  url: string
  deal_score: number | null
  roi_pct: number | null
  photo_url: string | null
  listing_type: string | null
  start_price_eur: number | null
  auction_state: string | null
  auction_stage: string | null
}

export interface ListingDetail extends Listing {
  description: string | null
  relist_of: string | null
  analyst_notes: string | null
  renovation_potential: number | null
  comp_avg_price_m2: number | null
  comp_count: number | null
  reno_cost_estimate: number | null
  roi_reno: number | null
  roi_quick_flip: number | null
  roi_massive: number | null
  estimated_roi: number | null
  elevator: boolean | null
  parking: boolean | null
  heating: string | null
  red_flags: string | null
  photo_assessment: string | null
  filter_tags: string[] | null
  photos: string[]
}

export interface MapMarker {
  id: string
  lat: number
  lng: number
  score: number
  price: string
  addr: string
  photo: string | null
  source?: string
}

export interface PaginatedListings {
  listings: Listing[]
  total: number
  page: number
  perPage: number
  totalPages: number
  markers: MapMarker[]
}
