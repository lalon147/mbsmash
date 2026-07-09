import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT * FROM invoice_types WHERE active = true ORDER BY sort_order, name'
  );
  return NextResponse.json(rows);
}

export async function POST(request) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'A name is required.' }, { status: 400 });
    }
    const { rows } = await pool.query(
      `INSERT INTO invoice_types (name, sort_order)
       VALUES ($1, (SELECT coalesce(max(sort_order), 0) + 1 FROM invoice_types))
       ON CONFLICT (name) DO UPDATE SET active = true
       RETURNING *`,
      [name.trim()]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('POST /api/invoice-types failed:', err);
    return NextResponse.json(
      { error: 'Could not add that invoice type. Please try again.' },
      { status: 500 }
    );
  }
}
