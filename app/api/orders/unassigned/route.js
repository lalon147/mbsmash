import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Parts still on order with nobody recorded as supplying them, each carrying
// the supplier this car's make has most often been ordered from.
//
// Two deliberate limits on what this returns:
//
//   * Only parts still on order. The vast majority of orders with no supplier
//     are ones that were already received — the part arrived, the job is done,
//     and nobody now remembers who supplied it. Filling those in from a guess
//     would be writing purchase history that never happened, and it would then
//     feed back into the very rankings the guess was drawn from. They are left
//     exactly as they are.
//
//   * The suggestion is a suggestion. `suggested_pct` is the share of that
//     make's recorded orders that went to it, and it is sent to the client so
//     the screen can show its working — "75% of Toyota parts" is a reasonable
//     default to accept, and also a plain warning that one in four was not.
//     A make nobody has ever recorded a supplier for gets no suggestion at all
//     rather than an invented one.
export async function GET() {
  const { rows } = await pool.query(`
    WITH history AS (
      SELECT v.make,
             o.dealership_id,
             d.name,
             count(*)                                                          AS n,
             round(100.0 * count(*) / sum(count(*)) OVER (PARTITION BY v.make)) AS pct,
             row_number() OVER (PARTITION BY v.make ORDER BY count(*) DESC)     AS rk
        FROM orders o
        JOIN vehicles v     ON v.id = o.vehicle_id
        JOIN dealerships d  ON d.id = o.dealership_id
       WHERE v.make IS NOT NULL
       GROUP BY v.make, o.dealership_id, d.name
    )
    SELECT o.id, o.part_name, o.part_number, o.quantity, o.order_date,
           v.id AS vehicle_id, v.registration, v.make, v.model,
           h.dealership_id AS suggested_id,
           h.name          AS suggested_name,
           h.pct           AS suggested_pct,
           h.n             AS suggested_n
      FROM orders o
      JOIN vehicles v ON v.id = o.vehicle_id
      LEFT JOIN history h ON h.make = v.make AND h.rk = 1
     WHERE o.status = 'ordered'
       AND o.dealership_id IS NULL
     ORDER BY v.registration, o.part_name
  `);
  return NextResponse.json(rows);
}
