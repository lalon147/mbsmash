import { NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange, diffFields } from '@/lib/audit';
import { parseYear, maxYear, INVALID } from '@/lib/year';

// What can be edited on the car itself, and how the value the browser sends
// becomes the value the column holds. Notes are free text: an empty box means
// "nothing unusual", which is null rather than a blank string.
//
// The year is editable because most cars in the table predate it having one,
// and a part number is only offered to a car whose year matches — so filling it
// in on an older car is what makes its history usable.
const EDITABLE = {
  notes: v => (typeof v === 'string' && v.trim() ? v.trim() : null),
  year:  parseYear,
};

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  const fields = Object.keys(EDITABLE).filter(f => body[f] !== undefined);
  if (fields.length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }
  if (parseYear(body.year) === INVALID) {
    return NextResponse.json(
      { error: `That year doesn't look right. Use a year between 1950 and ${maxYear()}.` },
      { status: 400 },
    );
  }

  try {
    const updated = await withAudit(async client => {
      const { rows: [before] } = await client.query(
        `SELECT * FROM vehicles WHERE id = $1 FOR UPDATE`,
        [id],
      );
      if (!before) return null;

      const values = fields.map(f => EDITABLE[f](body[f]));
      const sets = fields.map((f, i) => `${f} = $${i + 1}`);
      values.push(id);

      const { rows: [after] } = await client.query(
        `UPDATE vehicles SET ${sets.join(', ')}
          WHERE id = $${fields.length + 1}
          RETURNING *`,
        values,
      );

      await logChange(client, {
        entityType: 'vehicle', entityId: Number(id), vehicleId: Number(id),
        user, action: 'updated',
        changes: diffFields(before, after, fields),
      });

      // Hand back the same shape the list endpoint returns — make and model
      // resolved from their tables — so the client can drop this straight in.
      const { rows: [resolved] } = await client.query(`
        SELECT v.id, v.registration, v.customer_name, v.date_in, v.notes, v.created_at,
          v.make_id, v.model_id, v.year,
          COALESCE(mk.name, v.make) AS make,
          COALESCE(mo.name, v.model) AS model
        FROM vehicles v
        LEFT JOIN makes mk ON mk.id = v.make_id
        LEFT JOIN models mo ON mo.id = v.model_id
        WHERE v.id = $1
      `, [id]);
      return resolved;
    });

    if (!updated) return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/vehicles/[id] failed:', err);
    return NextResponse.json(
      { error: 'Could not save the change. Please try again.' },
      { status: 500 },
    );
  }
}
