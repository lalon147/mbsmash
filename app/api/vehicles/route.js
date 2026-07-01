import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(`
    SELECT v.id, v.registration, v.customer_name, v.date_in, v.notes, v.created_at,
      v.make_id, v.model_id,
      COALESCE(mk.name, v.make) AS make,
      COALESCE(mo.name, v.model) AS model
    FROM vehicles v
    LEFT JOIN makes mk ON mk.id = v.make_id
    LEFT JOIN models mo ON mo.id = v.model_id
    ORDER BY v.date_in DESC, v.created_at DESC
  `);
  return NextResponse.json(rows);
}

export async function POST(request) {
  const { registration, make_id, model_id, make, model, customer_name, date_in, notes } =
    await request.json();
  const { rows } = await pool.query(`
    INSERT INTO vehicles (registration, make_id, model_id, make, model, customer_name, date_in, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, registration, make_id, model_id, make, model, customer_name, date_in, notes, created_at
  `, [
    registration,
    make_id || null,
    model_id || null,
    make || null,
    model || null,
    customer_name || null,
    date_in || null,
    notes || null,
  ]);
  return NextResponse.json(rows[0], { status: 201 });
}
