import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(`SELECT id, name FROM makes ORDER BY name`);
  return NextResponse.json(rows);
}

export async function POST(request) {
  const { name } = await request.json();
  const { rows } = await pool.query(
    `INSERT INTO makes (name) VALUES ($1) RETURNING id, name`,
    [name.trim()]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
