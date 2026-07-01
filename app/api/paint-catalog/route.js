import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT * FROM paint_catalog WHERE active = true ORDER BY sort_order, part_name'
  );
  return NextResponse.json(rows);
}

export async function POST(request) {
  const { part_name } = await request.json();
  if (!part_name?.trim()) return NextResponse.json({ error: 'part_name required' }, { status: 400 });
  const { rows } = await pool.query(
    'INSERT INTO paint_catalog (part_name) VALUES ($1) RETURNING *',
    [part_name.trim().toUpperCase()]
  );
  return NextResponse.json(rows[0]);
}
