import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// A part with no expected date isn't overdue on any particular day, so it would
// never surface on its own — and most parts don't get one. Treat silence past
// this many days as late enough to be worth a phone call.
const STALE_AFTER_DAYS = 14;

// What "late" means, written once and used by both the count and the list, so
// the number beside the heading can never disagree with the rows under it.
// Both queries alias orders as `o` and their repair as `r`.
//
// A closed repair drops off the list entirely. That is the only honest way to
// tell "still waiting" from "the car went out months ago and nobody tidied up":
// nothing in the orders themselves records that the job finished, so the shop
// has to say so — by closing the repair, or by clearing the part from the chase
// list itself. An arbitrary date cut-off was the alternative, and it hides
// genuinely late parts as readily as leftovers.
const LATE = `
  o.status = 'ordered'
  AND r.status = 'open'
  AND coalesce(o.expected_date, o.order_date + $1::int) < current_date
`;

// How many late parts the dashboard will actually draw. High enough that a
// car's parts are never split across the boundary — the list groups by car and
// offers to clear a whole car at once, which would be a lie if half its parts
// had been cut off. The count beside the heading is still the real total.
const CHASE_LIMIT = 200;

export async function GET() {
  const { rows: [stats] } = await pool.query(`
    SELECT
      (SELECT count(*)::int FROM vehicles)                                        AS vehicle_count,
      (SELECT count(*)::int FROM orders WHERE status = 'ordered')                 AS pending_count,
      (SELECT count(*)::int FROM orders WHERE received_date = current_date)       AS received_today,
      (SELECT count(*)::int FROM orders o
        JOIN repairs r ON r.id = o.repair_id WHERE ${LATE})                       AS chasing_count,
      (SELECT coalesce(sum(unit_price * quantity), 0) FROM orders
        WHERE status = 'ordered')::numeric(10,2)                                  AS outstanding_cost
  `, [STALE_AFTER_DAYS]);

  const { rows: recent } = await pool.query(`
    SELECT v.id, v.registration, v.make, v.model,
      count(o.id) FILTER (WHERE o.status = 'ordered') AS pending_parts
    FROM vehicles v
    LEFT JOIN orders o ON o.vehicle_id = v.id
    GROUP BY v.id
    ORDER BY v.id DESC LIMIT 6
  `);

  // Parts still on order that should have turned up by now, worst first. The
  // dashboard groups these by car, and because the rows arrive worst-first each
  // car first appears at its own worst part — so grouping in arrival order puts
  // the car worth ringing about before the others at the top.
  const { rows: chasing } = await pool.query(`
    SELECT o.id, o.part_name, o.part_number, o.quantity, o.order_date, o.expected_date,
           v.id AS vehicle_id, v.registration, v.make, v.model,
           d.name AS dealership_name, d.phone AS dealership_phone,
           (current_date - coalesce(o.expected_date, o.order_date + $1::int))::int AS days_late
      FROM orders o
      JOIN repairs r          ON r.id = o.repair_id
      JOIN vehicles v         ON v.id = o.vehicle_id
      LEFT JOIN dealerships d ON d.id = o.dealership_id
     WHERE ${LATE}
     ORDER BY days_late DESC, v.registration
     LIMIT ${CHASE_LIMIT}
  `, [STALE_AFTER_DAYS]);

  return NextResponse.json({ stats, recent, chasing });
}
