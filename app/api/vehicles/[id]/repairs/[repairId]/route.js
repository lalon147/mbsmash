import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange, diffFields } from '@/lib/audit';

// Rename a repair, or open/close it. Closing stamps closed_date; reopening
// clears it, so the date always reflects the current status.
const EDITABLE = {
  title:  v => v?.trim() || null,
  status: v => (v === 'closed' ? 'closed' : 'open'),
  notes:  v => v?.trim() || null,
};

export async function PATCH(request, { params }) {
  const { id, repairId } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  const fields = Object.keys(EDITABLE).filter(f => body[f] !== undefined);
  if (fields.length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  try {
    const updated = await withAudit(async client => {
      const { rows: [before] } = await client.query(
        `SELECT * FROM repairs WHERE id = $1 AND vehicle_id = $2 FOR UPDATE`,
        [repairId, id],
      );
      if (!before) return null;

      const values = fields.map(f => EDITABLE[f](body[f]));
      const sets = fields.map((f, i) => `${f} = $${i + 1}`);
      // Keep closed_date in step with status without the client having to send it.
      if (fields.includes('status')) {
        sets.push(`closed_date = CASE WHEN $${fields.indexOf('status') + 1} = 'closed'
                                      THEN current_date ELSE NULL END`);
      }
      values.push(repairId, id);

      const { rows: [after] } = await client.query(
        `UPDATE repairs SET ${sets.join(', ')}
          WHERE id = $${fields.length + 1} AND vehicle_id = $${fields.length + 2}
          RETURNING *`,
        values,
      );

      await logChange(client, {
        entityType: 'repair', entityId: Number(repairId), vehicleId: Number(id),
        user, action: 'updated',
        changes: diffFields(before, after, fields),
      });
      return after;
    });

    if (!updated) return NextResponse.json({ error: 'Repair not found.' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/vehicles/[id]/repairs/[repairId] failed:', err);
    return NextResponse.json(
      { error: 'Could not save changes. Please try again.' },
      { status: 500 },
    );
  }
}
