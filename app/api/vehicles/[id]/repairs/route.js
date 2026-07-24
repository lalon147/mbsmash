import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';

// A car's repairs (one per accident/job), newest first, each carrying the part
// counts the vehicle page needs to label its chips ("3 pending"). Counting here
// keeps the client from having to slice the orders list itself.
export async function GET(request, { params }) {
  const { id } = await params;
  const { rows } = await pool.query(
    `SELECT r.id, r.vehicle_id, r.title, r.status, r.opened_date,
            r.closed_date, r.notes, r.created_at,
            count(o.id)                                        AS total_parts,
            count(o.id) FILTER (WHERE o.status = 'ordered')    AS pending_parts
       FROM repairs r
       LEFT JOIN orders o ON o.repair_id = r.id
      WHERE r.vehicle_id = $1
      GROUP BY r.id
      ORDER BY r.created_at`,
    [id],
  );
  return NextResponse.json(rows);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const { title, opened_date } = await request.json();

    const created = await withAudit(async client => {
      const { rows: [repair] } = await client.query(
        `INSERT INTO repairs (vehicle_id, title, opened_date)
         VALUES ($1, $2, COALESCE($3::date, current_date))
         RETURNING *`,
        [id, title?.trim() || null, opened_date || null],
      );

      await logChange(client, {
        entityType: 'repair', entityId: repair.id, vehicleId: Number(id),
        user, action: 'created',
      });
      return { ...repair, total_parts: 0, pending_parts: 0 };
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('POST /api/vehicles/[id]/repairs failed:', err);
    return NextResponse.json(
      { error: 'Could not start a new repair. Please try again.' },
      { status: 500 },
    );
  }
}
