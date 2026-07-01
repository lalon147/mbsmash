import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows: [stats] } = await pool.query(`
    SELECT
      (SELECT count(*)::int FROM vehicles)                                        AS vehicle_count,
      (SELECT count(*)::int FROM orders WHERE status = 'ordered')                 AS pending_count,
      (SELECT count(*)::int FROM orders WHERE received_date = current_date)       AS received_today,
      (SELECT coalesce(sum(unit_price * quantity), 0) FROM orders
        WHERE status = 'ordered')::numeric(10,2)                                  AS outstanding_cost
  `);
  const { rows: recent } = await pool.query(`
    SELECT v.id, v.registration, v.make, v.model,
      count(o.id) FILTER (WHERE o.status = 'ordered') AS pending_parts
    FROM vehicles v
    LEFT JOIN orders o ON o.vehicle_id = v.id
    GROUP BY v.id
    ORDER BY v.id DESC LIMIT 6
  `);
  return NextResponse.json({ stats, recent });
}
