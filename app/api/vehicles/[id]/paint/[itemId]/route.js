import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(request, { params }) {
  const { id, itemId } = await params;
  const { status } = await request.json();
  const { rows } = await pool.query(
    'UPDATE vehicle_paint_items SET status = $1 WHERE id = $2 AND vehicle_id = $3 RETURNING *',
    [status, itemId, id]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(request, { params }) {
  const { id, itemId } = await params;
  await pool.query(
    'DELETE FROM vehicle_paint_items WHERE id = $1 AND vehicle_id = $2',
    [itemId, id]
  );
  return NextResponse.json({ ok: true });
}
