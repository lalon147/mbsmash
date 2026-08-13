import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';

// Most-ordered first. The parts a smash repairer reaches for are the same
// handful over and over — front bars, headlights, guards — so putting them at
// the top of the list means the usual part is the first thing on screen instead
// of something alphabetical that nobody has ordered since last year.
// Ties fall back to the name, so the order is stable between searches.
const POPULAR_FIRST = `
  SELECT p.*, count(o.id) AS order_count
  FROM parts_catalog p
  LEFT JOIN orders o ON o.catalog_part_id = p.id
  WHERE p.active = true
`;
const RANK_AND_LIMIT = `
  GROUP BY p.id
  ORDER BY count(o.id) DESC, p.part_name
  LIMIT 30
`;

export async function GET(request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() || '';
  const { rows } = q
    ? await pool.query(
        `${POPULAR_FIRST}
           AND (lower(p.part_name) LIKE $1 OR lower(p.part_number) LIKE $1)
         ${RANK_AND_LIMIT}`,
        [`%${q.toLowerCase()}%`],
      )
    : await pool.query(`${POPULAR_FIRST} ${RANK_AND_LIMIT}`);
  return NextResponse.json(rows);
}

export async function POST(request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const { part_name } = await request.json();
    if (!part_name?.trim()) {
      return NextResponse.json({ error: 'part_name required' }, { status: 400 });
    }

    const created = await withAudit(async client => {
      const { rows: [part] } = await client.query(
        'INSERT INTO parts_catalog (part_name) VALUES ($1) RETURNING *',
        [part_name.trim().toUpperCase()],
      );
      // No vehicle: the catalog belongs to the shop, not to a car, so this
      // shows up in the entity history rather than on any vehicle's timeline.
      await logChange(client, {
        entityType: 'catalog_part', entityId: part.id, user, action: 'created',
      });
      return part;
    });

    return NextResponse.json(created);
  } catch (err) {
    console.error('POST /api/catalog failed:', err);
    return NextResponse.json(
      { error: 'Could not add that part. Please try again.' },
      { status: 500 },
    );
  }
}
