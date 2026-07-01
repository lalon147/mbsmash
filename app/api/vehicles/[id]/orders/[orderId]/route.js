import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(request, { params }) {
  const { id, orderId } = await params;
  const { status } = await request.json();
  const { rows } = await pool.query(`
    UPDATE orders
    SET status = $1,
        received_date = CASE WHEN $1 = 'received' THEN current_date ELSE received_date END
    WHERE id = $2 AND vehicle_id = $3
    RETURNING *
  `, [status, orderId, id]);
  return NextResponse.json(rows[0]);
}
