import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    `SELECT id, name, phone, email FROM dealerships ORDER BY name`
  );
  return NextResponse.json(rows);
}

export async function POST(request) {
  const { name, phone, email } = await request.json();
  const { rows } = await pool.query(
    `INSERT INTO dealerships (name, phone, email) VALUES ($1,$2,$3)
     RETURNING id, name, phone, email`,
    [name.trim(), phone || null, email || null]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
