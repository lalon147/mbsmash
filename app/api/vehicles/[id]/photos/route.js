import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';

const MAX_PHOTOS = 2;
// Photos are resized client-side to ~1280px JPEG; anything bigger than this
// means the resize was skipped and the row would bloat the table.
const MAX_DATA_URL_LENGTH = 2_000_000;

export async function GET(request, { params }) {
  const { id } = await params;
  const { rows } = await pool.query(
    `SELECT id, data_url, created_at FROM vehicle_photos WHERE vehicle_id = $1 ORDER BY created_at`,
    [id],
  );
  return NextResponse.json(rows);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const { data_url } = await request.json();
    if (!data_url || !data_url.startsWith('data:image/')) {
      return NextResponse.json({ error: 'That file is not a photo.' }, { status: 400 });
    }
    if (data_url.length > MAX_DATA_URL_LENGTH) {
      return NextResponse.json({ error: 'That photo is too large. Please try again.' }, { status: 400 });
    }

    const photo = await withAudit(async client => {
      // Lock the car, then count. Two phones uploading at the same moment would
      // otherwise both see one photo and both insert, landing on three.
      // (The lock has to be on a row — `count(*) … FOR UPDATE` is not legal SQL.)
      await client.query(`SELECT id FROM vehicles WHERE id = $1 FOR UPDATE`, [id]);

      const { rows: [{ count }] } = await client.query(
        `SELECT count(*)::int AS count FROM vehicle_photos WHERE vehicle_id = $1`,
        [id],
      );
      if (count >= MAX_PHOTOS) return { limitReached: true };

      const { rows: [row] } = await client.query(
        `INSERT INTO vehicle_photos (vehicle_id, data_url)
         VALUES ($1, $2)
         RETURNING id, data_url, created_at`,
        [id, data_url],
      );

      await logChange(client, {
        entityType: 'photo', entityId: row.id, vehicleId: Number(id),
        user, action: 'created',
      });
      return row;
    });

    if (photo.limitReached) {
      return NextResponse.json(
        { error: `Only ${MAX_PHOTOS} photos per vehicle — delete one first.` },
        { status: 400 },
      );
    }
    return NextResponse.json(photo, { status: 201 });
  } catch (err) {
    console.error('POST /api/vehicles/[id]/photos failed:', err);
    return NextResponse.json(
      { error: 'Could not save the photo. Please try again.' },
      { status: 500 },
    );
  }
}
