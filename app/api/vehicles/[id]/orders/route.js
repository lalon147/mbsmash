import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const { rows } = await pool.query(
    `SELECT * FROM orders WHERE vehicle_id = $1 ORDER BY created_at`,
    [id]
  );
  return NextResponse.json(rows);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const {
    catalog_part_id, part_name, part_number, dealership_id,
    quantity, unit_price, expected_date, status,
  } = await request.json();
  const { rows } = await pool.query(`
    INSERT INTO orders
      (vehicle_id, catalog_part_id, part_name, part_number, dealership_id,
       quantity, unit_price, expected_date, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `, [
    id,
    catalog_part_id || null,
    part_name,
    part_number || null,
    dealership_id || null,
    quantity || 1,
    unit_price || null,
    expected_date || null,
    status || 'ordered',
  ]);
  return NextResponse.json(rows[0], { status: 201 });
}
