import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  const district = new URL(req.url).searchParams.get('district')
  const client = await pool.connect()
  try {
    const res = district
      ? await client.query(
          `SELECT DISTINCT street FROM listings WHERE district = $1 AND street IS NOT NULL ORDER BY street`,
          [district]
        )
      : await client.query(
          `SELECT DISTINCT street FROM listings WHERE street IS NOT NULL ORDER BY street`
        )
    return NextResponse.json(res.rows.map((r: any) => r.street))
  } finally {
    client.release()
  }
}
