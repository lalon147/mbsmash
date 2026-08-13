import { NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange, diffFields } from '@/lib/audit';

// The column carries the same check constraint. Validating here as well turns a
// bad value into a 400 that says what was wrong, instead of a constraint
// violation surfacing as a blank 500.
const STATUSES = ['to_paint', 'painted'];

export async function PATCH(request, { params }) {
  const { id, itemId } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const { status } = await request.json();
    if (!STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${STATUSES.join(', ')}.` },
        { status: 400 },
      );
    }

    const updated = await withAudit(async client => {
      const { rows: [before] } = await client.query(
        'SELECT * FROM vehicle_paint_items WHERE id = $1 AND vehicle_id = $2 FOR UPDATE',
        [itemId, id],
      );
      if (!before) return null;

      const { rows: [after] } = await client.query(
        'UPDATE vehicle_paint_items SET status = $1 WHERE id = $2 AND vehicle_id = $3 RETURNING *',
        [status, itemId, id],
      );

      await logChange(client, {
        entityType: 'paint_item', entityId: Number(itemId), vehicleId: Number(id),
        user, action: 'updated',
        changes: diffFields(before, after, ['status']),
      });
      return after;
    });

    if (!updated) {
      return NextResponse.json({ error: 'That paint part no longer exists.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/vehicles/[id]/paint/[itemId] failed:', err);
    return NextResponse.json(
      { error: 'Could not update that paint part. Please try again.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const { id, itemId } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    await withAudit(async client => {
      const { rowCount } = await client.query(
        'DELETE FROM vehicle_paint_items WHERE id = $1 AND vehicle_id = $2',
        [itemId, id],
      );
      // Nothing deleted means nothing happened — don't log a phantom change.
      if (rowCount === 0) return;

      await logChange(client, {
        entityType: 'paint_item', entityId: Number(itemId), vehicleId: Number(id),
        user, action: 'deleted',
      });
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/vehicles/[id]/paint/[itemId] failed:', err);
    return NextResponse.json(
      { error: 'Could not remove that paint part. Please try again.' },
      { status: 500 },
    );
  }
}
