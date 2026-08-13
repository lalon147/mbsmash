import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';

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
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const { name, phone, email } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'A name is required.' }, { status: 400 });
    }

    const created = await withAudit(async client => {
      const { rows: [dealership] } = await client.query(
        `INSERT INTO dealerships (name, phone, email) VALUES ($1,$2,$3)
         RETURNING id, name, phone, email`,
        [name.trim(), phone || null, email || null],
      );
      await logChange(client, {
        entityType: 'dealership', entityId: dealership.id, user, action: 'created',
      });
      return dealership;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('POST /api/dealerships failed:', err);
    return NextResponse.json(
      { error: 'Could not save the supplier. Please try again.' },
      { status: 500 },
    );
  }
}
