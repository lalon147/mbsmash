import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Most-used first, the same way the parts catalog ranks itself — but a
// dealership is chosen for the car in front of you, not in the abstract. The
// make is the strongest predictor there is: Lexus parts come from Lexus
// Blackburn, GWM from South Morang Haval, Toyota from Preston Toyota. So the
// dealerships this make has actually been ordered from come first, then
// everyone else by overall usage, then alphabetical so the list never shuffles
// between two suppliers with the same count.
//
// `make` is optional. Without it the first term counts nothing and the ranking
// falls back to plain overall usage, which is what a list with no car attached
// wants anyway.
export async function GET(request) {
  const make = new URL(request.url).searchParams.get('make')?.trim() || null;
  const { rows } = await pool.query(
    `SELECT d.id, d.name, d.phone, d.email,
            count(o.id)                                       AS order_count,
            count(o.id) FILTER (WHERE v.make = $1::text)      AS make_count
     FROM dealerships d
     LEFT JOIN orders o   ON o.dealership_id = d.id
     LEFT JOIN vehicles v ON v.id = o.vehicle_id
     GROUP BY d.id
     ORDER BY count(o.id) FILTER (WHERE v.make = $1::text) DESC,
              count(o.id) DESC,
              d.name`,
    [make],
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
