import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const { rows } = await pool.query(
    `SELECT id, make_id, name FROM models WHERE make_id = $1 ORDER BY name`,
    [id]
  );
  return NextResponse.json(rows);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const { name } = await request.json();
  const { rows } = await pool.query(
    `INSERT INTO models (make_id, name) VALUES ($1,$2) RETURNING id, make_id, name`,
    [id, name.trim()]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
