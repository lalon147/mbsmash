import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Busiest make first — the shop books in far more Toyotas than anything else,
// so an alphabetical list buries the usual answer behind Audi and BMW. Makes
// nobody has brought in yet still appear, alphabetically, after the ones that
// have. The order follows the work: it shifts on its own as the mix changes.
export async function GET() {
  const { rows } = await pool.query(`
    SELECT mk.id, mk.name
    FROM makes mk
    LEFT JOIN vehicles v ON v.make_id = mk.id
    GROUP BY mk.id, mk.name
    ORDER BY count(v.id) DESC, mk.name
  `);
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
