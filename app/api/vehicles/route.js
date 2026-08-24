import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';
import { parseYear, maxYear, INVALID } from '@/lib/year';

export async function GET() {
  const { rows } = await pool.query(`
    SELECT v.id, v.registration, v.customer_name, v.date_in, v.notes, v.created_at,
      v.make_id, v.model_id, v.year,
      COALESCE(mk.name, v.make) AS make,
      COALESCE(mo.name, v.model) AS model
    FROM vehicles v
    LEFT JOIN makes mk ON mk.id = v.make_id
    LEFT JOIN models mo ON mo.id = v.model_id
    ORDER BY v.date_in DESC, v.created_at DESC
  `);
  return NextResponse.json(rows);
}

export async function POST(request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const { registration, make_id, model_id, make, model, year, customer_name, date_in, notes } =
      await request.json();
    if (!registration?.trim()) {
      return NextResponse.json({ error: 'Registration is required.' }, { status: 400 });
    }
    // The year is what separates a 2016 Camry's front bar from a 2017 one, so a
    // typo in it is worse than a blank — it would quietly borrow another car's
    // part numbers. Anything that isn't a plausible model year is refused here
    // rather than saved and puzzled over later.
    const modelYear = parseYear(year);
    if (modelYear === INVALID) {
      return NextResponse.json(
        { error: `That year doesn't look right. Use a year between 1950 and ${maxYear()}.` },
        { status: 400 },
      );
    }
    const created = await withAudit(async client => {
      const { rows: [vehicle] } = await client.query(`
        INSERT INTO vehicles (registration, make_id, model_id, make, model, year, customer_name, date_in, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, registration, make_id, model_id, make, model, year, customer_name, date_in, notes, created_at
      `, [
        registration.trim(),
        make_id || null,
        model_id || null,
        make || null,
        model || null,
        modelYear,
        customer_name || null,
        date_in || null,
        notes || null,
      ]);

      // Every part hangs off a repair, so a car booked in with none can't take
      // any parts at all. Open its first one here, in the same transaction —
      // dated the day the car came in, matching what migration 013 backfilled.
      await client.query(
        `INSERT INTO repairs (vehicle_id, title, opened_date)
         VALUES ($1, 'Repair 1', COALESCE($2::date, current_date))`,
        [vehicle.id, date_in || null],
      );

      await logChange(client, {
        entityType: 'vehicle', entityId: vehicle.id, vehicleId: vehicle.id,
        user, action: 'created',
      });
      return vehicle;
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    // Log the real error server-side; only send a safe message to the browser.
    console.error('POST /api/vehicles failed:', err);
    if (err.code === '23505') {
      return NextResponse.json(
        { error: 'A vehicle with this registration already exists. Search for it in the list instead.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Could not save the vehicle — a database problem occurred. Please try again.' },
      { status: 500 }
    );
  }
}
