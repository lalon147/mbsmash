import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(request, { params }) {
  const { id, photoId } = await params;
  await pool.query(
    `DELETE FROM vehicle_photos WHERE id = $1 AND vehicle_id = $2`,
    [photoId, id]
  );
  return NextResponse.json({ ok: true });
}
