import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() || '';
  const { rows } = q
    ? await pool.query(`
        SELECT * FROM parts_catalog
        WHERE active = true
          AND (lower(part_name) LIKE $1 OR lower(part_number) LIKE $1)
        ORDER BY part_name LIMIT 30
      `, [`%${q.toLowerCase()}%`])
    : await pool.query(`
        SELECT * FROM parts_catalog WHERE active = true ORDER BY part_name LIMIT 30
      `);
  return NextResponse.json(rows);
}

export async function POST(request) {
  const { part_name } = await request.json();
  if (!part_name?.trim()) return NextResponse.json({ error: 'part_name required' }, { status: 400 });
  const { rows } = await pool.query(
    'INSERT INTO parts_catalog (part_name) VALUES ($1) RETURNING *',
    [part_name.trim().toUpperCase()]
  );
  return NextResponse.json(rows[0]);
}
