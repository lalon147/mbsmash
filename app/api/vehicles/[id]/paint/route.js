import { NextResponse } from 'next/server';
import pool from '@/lib/db';

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
  const { part_name } = await request.json();
  const { rows } = await pool.query(
    'INSERT INTO vehicle_paint_items (vehicle_id, part_name) VALUES ($1, $2) RETURNING *',
    [id, part_name]
  );
  return NextResponse.json(rows[0]);
}
