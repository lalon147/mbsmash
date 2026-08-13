import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';

export async function GET(request, { params }) {
  const { id } = await params;
  const { rows } = await pool.query(
    'SELECT * FROM vehicle_paint_items WHERE vehicle_id = $1 ORDER BY created_at',
    [id]
  );
  return NextResponse.json(rows);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const { part_name } = await request.json();
    if (!part_name?.trim()) {
      return NextResponse.json({ error: 'part_name required' }, { status: 400 });
    }

    const created = await withAudit(async client => {
      const { rows: [item] } = await client.query(
        'INSERT INTO vehicle_paint_items (vehicle_id, part_name) VALUES ($1, $2) RETURNING *',
        [id, part_name.trim()],
      );
      // Paint is work done to a specific car, so this belongs on that car's
      // history alongside its parts and invoices.
      await logChange(client, {
        entityType: 'paint_item', entityId: item.id, vehicleId: Number(id),
        user, action: 'created',
      });
      return item;
    });

    return NextResponse.json(created);
  } catch (err) {
    console.error('POST /api/vehicles/[id]/paint failed:', err);
    return NextResponse.json(
      { error: 'Could not add that paint part. Please try again.' },
      { status: 500 },
    );
  }
}
