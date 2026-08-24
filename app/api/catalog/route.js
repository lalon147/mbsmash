import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';

// What this part cost and what number was on the invoice, the last time the
// shop ordered it FOR THIS CAR — same make, same model, and preferably the same
// year. A front bar is a different part on a 2016 Camry and a 2017 one, so the
// catalog itself can't hold a number; it holds names. The number lives on the
// orders, where it was typed off an invoice for a particular car, and is read
// back out here for a car that matches.
//
// Same year first, then most recent. A different year of the same model still
// comes back — it is the best guess there is when this year has never been
// ordered — but it is flagged (`same_year: false`) so the app can show it as
// something to check rather than filling it in behind someone's back.
//
// `same_year` needs both years on the table: a car with no year recorded is not
// the same year as anything, it is a car nobody has identified yet. So an
// unknown year gets suggestions to check rather than a filled-in number, which
// is also the nudge to go and put the year on the car.
//
// A car with no make or model recorded matches nothing: lower(null) = lower(x)
// is null, never true. That is the right answer — an unidentified car has no
// parts history worth trusting.
const fitment = (column, alias) => `
  LEFT JOIN LATERAL (
    SELECT o.${column} AS value, v.year, o.order_date,
           (car.year IS NOT NULL AND v.year = car.year) AS same_year
      FROM orders o
      JOIN vehicles v ON v.id = o.vehicle_id
     WHERE o.catalog_part_id = p.id
       AND o.${column} IS NOT NULL
       AND lower(v.make)  = car.make
       AND lower(v.model) = car.model
     ORDER BY (car.year IS NOT NULL AND v.year = car.year) DESC NULLS LAST,
              o.order_date DESC NULLS LAST, o.id DESC
     LIMIT 1
  ) ${alias} ON true`;

// Most-ordered first. The parts a smash repairer reaches for are the same
// handful over and over — front bars, headlights, guards — so putting them at
// the top of the list means the usual part is the first thing on screen instead
// of something alphabetical that nobody has ordered since last year.
// Ties fall back to the name, so the order is stable between searches.
const SEARCH = `
  WITH car AS (
    SELECT lower(make) AS make, lower(model) AS model, year
      FROM vehicles WHERE id = $2::bigint
  )
  SELECT p.id, p.part_name, p.default_dealership_id,
         (SELECT count(*) FROM orders o WHERE o.catalog_part_id = p.id) AS order_count,
         num.value     AS fit_part_number,
         num.same_year AS fit_number_same_year,
         num.year      AS fit_number_year,
         num.order_date AS fit_number_date,
         price.value     AS fit_price,
         price.same_year AS fit_price_same_year,
         price.year      AS fit_price_year
    FROM parts_catalog p
    LEFT JOIN car ON true
    ${fitment('part_number', 'num')}
    ${fitment('unit_price', 'price')}
   WHERE p.active = true
`;
const RANK_AND_LIMIT = `
  ORDER BY order_count DESC, p.part_name
  LIMIT 30
`;

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const q = params.get('q')?.trim() || '';
  const vehicleId = Number(params.get('vehicle_id')) || null;

  // Searching a part number looks through what has actually been ordered under
  // each name, now that the name itself no longer carries one.
  const { rows } = await pool.query(
    q
      ? `${SEARCH}
           AND (lower(p.part_name) LIKE $1
                OR EXISTS (SELECT 1 FROM orders o2
                            WHERE o2.catalog_part_id = p.id
                              AND lower(o2.part_number) LIKE $1))
         ${RANK_AND_LIMIT}`
      : `${SEARCH} ${RANK_AND_LIMIT}`,
    [`%${q.toLowerCase()}%`, vehicleId],
  );
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
