import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const MAX_PHOTOS = 2;
// Photos are resized client-side to ~1280px JPEG; anything bigger than this
// means the resize was skipped and the row would bloat the table.
const MAX_DATA_URL_LENGTH = 2_000_000;

export async function GET(request, { params }) {
  const { id } = await params;
  const { rows } = await pool.query(
    `SELECT id, data_url, created_at FROM vehicle_photos WHERE vehicle_id = $1 ORDER BY created_at`,
    [id]
  );
  return NextResponse.json(rows);
}

export async function POST(request, { params }) {
  const { id } = await params;
  try {
    const { data_url } = await request.json();
    if (!data_url || !data_url.startsWith('data:image/')) {
      return NextResponse.json({ error: 'That file is not a photo.' }, { status: 400 });
    }
    if (data_url.length > MAX_DATA_URL_LENGTH) {
      return NextResponse.json({ error: 'That photo is too large. Please try again.' }, { status: 400 });
    }
    const { rows: [{ count }] } = await pool.query(
      `SELECT count(*)::int AS count FROM vehicle_photos WHERE vehicle_id = $1`,
      [id]
    );
    if (count >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Only ${MAX_PHOTOS} photos per vehicle — delete one first.` },
        { status: 400 }
      );
    }
    const { rows } = await pool.query(
      `INSERT INTO vehicle_photos (vehicle_id, data_url)
       VALUES ($1, $2)
       RETURNING id, data_url, created_at`,
      [id, data_url]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('POST /api/vehicles/[id]/photos failed:', err);
    return NextResponse.json(
      { error: 'Could not save the photo. Please try again.' },
      { status: 500 }
    );
  }
}
