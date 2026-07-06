import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const MAX_DATA_URL_LENGTH = 2_000_000;

export async function PATCH(request, { params }) {
  const { id, orderId } = await params;
  const body = await request.json();
  const { status } = body;

  if (status !== undefined) {
    const { rows } = await pool.query(`
      UPDATE orders
      SET status = $1::order_status,
          received_date = CASE WHEN $1::order_status = 'received' THEN current_date ELSE received_date END
      WHERE id = $2 AND vehicle_id = $3
      RETURNING *
    `, [status, orderId, id]);
    return NextResponse.json(rows[0]);
  }

  if ('invoice_photo' in body) {
    const { invoice_photo } = body;
    if (invoice_photo && (!invoice_photo.startsWith('data:image/') || invoice_photo.length > MAX_DATA_URL_LENGTH)) {
      return NextResponse.json({ error: 'That file is not a usable photo.' }, { status: 400 });
    }
    const { rows } = await pool.query(
      `UPDATE orders SET invoice_photo = $1 WHERE id = $2 AND vehicle_id = $3 RETURNING *`,
      [invoice_photo || null, orderId, id]
    );
    return NextResponse.json(rows[0]);
  }

  const { dealership_id, unit_price, quantity, part_number, expected_date } = body;
  const sets = [];
  const values = [];
  let i = 1;
  if (dealership_id !== undefined) { sets.push(`dealership_id = $${i++}`); values.push(dealership_id || null); }
  if (unit_price !== undefined)    { sets.push(`unit_price = $${i++}`);    values.push(unit_price === '' || unit_price === null ? null : Number(unit_price)); }
  if (quantity !== undefined)      { sets.push(`quantity = $${i++}`);      values.push(Number(quantity) || 1); }
  if (part_number !== undefined)   { sets.push(`part_number = $${i++}`);   values.push(part_number || null); }
  if (expected_date !== undefined) { sets.push(`expected_date = $${i++}`); values.push(expected_date || null); }

  if (sets.length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }
  values.push(orderId, id);
  const { rows } = await pool.query(
    `UPDATE orders SET ${sets.join(', ')} WHERE id = $${i++} AND vehicle_id = $${i} RETURNING *`,
    values
  );
  return NextResponse.json(rows[0]);
}
