import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const MAX_DATA_URL_LENGTH = 2_000_000;

export async function PATCH(request, { params }) {
  const { id, orderId } = await params;
  const { status, invoice_photo } = await request.json();

  if (status !== undefined) {
    const { rows } = await pool.query(`
      UPDATE orders
      SET status = $1,
          received_date = CASE WHEN $1 = 'received' THEN current_date ELSE received_date END
      WHERE id = $2 AND vehicle_id = $3
      RETURNING *
    `, [status, orderId, id]);
    return NextResponse.json(rows[0]);
  }

  if (invoice_photo && (!invoice_photo.startsWith('data:image/') || invoice_photo.length > MAX_DATA_URL_LENGTH)) {
    return NextResponse.json({ error: 'That file is not a usable photo.' }, { status: 400 });
  }
  const { rows } = await pool.query(
    `UPDATE orders SET invoice_photo = $1 WHERE id = $2 AND vehicle_id = $3 RETURNING *`,
    [invoice_photo || null, orderId, id]
  );
  return NextResponse.json(rows[0]);
}
