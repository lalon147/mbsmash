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
      catalog_part_id, part_name, part_number, dealership_id,
      quantity, unit_price, expected_date, status,
    } = await request.json();

    const created = await withAudit(async client => {
      const { rows: [order] } = await client.query(`
        INSERT INTO orders
          (vehicle_id, catalog_part_id, part_name, part_number, dealership_id,
           quantity, unit_price, expected_date, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
      `, [
        id,
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
