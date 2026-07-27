import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';

export async function GET(request, { params }) {
  const { id } = await params;
  const { rows } = await pool.query(
    `SELECT * FROM orders WHERE vehicle_id = $1 ORDER BY created_at`,
    [id],
  );
  return NextResponse.json(rows);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const {
      repair_id, catalog_part_id, part_name, part_number, dealership_id,
      quantity, unit_price, expected_date, status,
    } = await request.json();

    const created = await withAudit(async client => {
      // Attach to the repair the caller named; fall back to the car's newest
      // repair so a client that doesn't send one still lands somewhere sensible
      // rather than erroring on the NOT NULL column. Each branch passes only
      // the parameters its own query uses — a query that skips $1 but uses $2
      // leaves $1's type unknowable and Postgres rejects the whole statement.
      const { rows: [found] } = repair_id
        ? await client.query(
            `SELECT id FROM repairs WHERE id = $1 AND vehicle_id = $2`,
            [repair_id, id],
          )
        : await client.query(
            `SELECT id FROM repairs WHERE vehicle_id = $1
             ORDER BY created_at DESC LIMIT 1`,
            [id],
          );

      // A car with no repair at all — booked in before vehicle creation started
      // opening one — would otherwise be stuck unable to take any part. Open its
      // first repair now instead of failing.
      const { rows: [target] } = found
        ? { rows: [found] }
        : await client.query(
            `INSERT INTO repairs (vehicle_id, title) VALUES ($1, 'Repair 1')
             RETURNING id`,
            [id],
          );

      const { rows: [order] } = await client.query(`
        INSERT INTO orders
          (vehicle_id, repair_id, catalog_part_id, part_name, part_number, dealership_id,
           quantity, unit_price, expected_date, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      `, [
        id,
        target.id,
        catalog_part_id || null,
        part_name,
        part_number || null,
        dealership_id || null,
        quantity || 1,
        unit_price || null,
        expected_date || null,
        status || 'ordered',
      ]);

      await logChange(client, {
        entityType: 'order', entityId: order.id, vehicleId: Number(id),
        user, action: 'created',
      });
      return order;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('POST /api/vehicles/[id]/orders failed:', err);
    return NextResponse.json(
      { error: 'Could not add the part. Please try again.' },
      { status: 500 },
    );
  }
}
