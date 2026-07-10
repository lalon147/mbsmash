import { NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange, diffFields } from '@/lib/audit';

// Every editable column, and how a value arriving from the browser becomes the
// value the column holds. Keeping them in one place means the SET clause, the
// audit diff and the validation can't drift apart.
const EDITABLE = {
  dealership_id: v => v || null,
  unit_price:    v => (v === '' || v === null ? null : Number(v)),
  quantity:      v => Number(v) || 1,
  part_number:   v => v || null,
  expected_date: v => v || null,
};

export async function PATCH(request, { params }) {
  const { id, orderId } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const body = await request.json();

  try {
    if (body.status !== undefined) {
      const updated = await withAudit(async client => {
        const { rows: [before] } = await client.query(
          `SELECT * FROM orders WHERE id = $1 AND vehicle_id = $2 FOR UPDATE`,
          [orderId, id],
        );
        if (!before) return null;

        // Both placeholders are cast: an untyped $1 shared between the enum
        // column and the CASE comparison makes Postgres give up deducing a type.
        const { rows: [after] } = await client.query(
          `UPDATE orders
              SET status = $1::order_status,
                  received_date = CASE WHEN $1::order_status = 'received'
                                       THEN current_date ELSE received_date END
            WHERE id = $2 AND vehicle_id = $3
            RETURNING *`,
          [body.status, orderId, id],
        );

        await logChange(client, {
          entityType: 'order', entityId: Number(orderId), vehicleId: Number(id),
          user, action: 'updated',
          changes: diffFields(before, after, ['status']),
        });
        return after;
      });

      if (!updated) return NextResponse.json({ error: 'Part not found.' }, { status: 404 });
      return NextResponse.json(updated);
    }

    const fields = Object.keys(EDITABLE).filter(f => body[f] !== undefined);
    if (fields.length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const updated = await withAudit(async client => {
      const { rows: [before] } = await client.query(
        `SELECT * FROM orders WHERE id = $1 AND vehicle_id = $2 FOR UPDATE`,
        [orderId, id],
      );
      if (!before) return null;

      const values = fields.map(f => EDITABLE[f](body[f]));
      const sets = fields.map((f, i) => `${f} = $${i + 1}`);
      values.push(orderId, id);

      const { rows: [after] } = await client.query(
        `UPDATE orders SET ${sets.join(', ')}
          WHERE id = $${fields.length + 1} AND vehicle_id = $${fields.length + 2}
          RETURNING *`,
        values,
      );

      await logChange(client, {
        entityType: 'order', entityId: Number(orderId), vehicleId: Number(id),
        user, action: 'updated',
        changes: diffFields(before, after, fields),
      });
      return after;
    });

    if (!updated) return NextResponse.json({ error: 'Part not found.' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/vehicles/[id]/orders/[orderId] failed:', err);
    return NextResponse.json(
      { error: 'Could not save changes. Please try again.' },
      { status: 500 },
    );
  }
}
