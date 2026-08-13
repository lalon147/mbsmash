import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT * FROM paint_catalog WHERE active = true ORDER BY sort_order, part_name'
  );
  return NextResponse.json(rows);
}

export async function POST(request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const { part_name } = await request.json();
    if (!part_name?.trim()) {
      return NextResponse.json({ error: 'part_name required' }, { status: 400 });
    }

    const created = await withAudit(async client => {
      const { rows: [part] } = await client.query(
        'INSERT INTO paint_catalog (part_name) VALUES ($1) RETURNING *',
        [part_name.trim().toUpperCase()],
      );
      await logChange(client, {
        entityType: 'paint_catalog_part', entityId: part.id, user, action: 'created',
      });
      return part;
    });

    return NextResponse.json(created);
  } catch (err) {
    console.error('POST /api/paint-catalog failed:', err);
    return NextResponse.json(
      { error: 'Could not add that paint part. Please try again.' },
      { status: 500 },
    );
  }
}
