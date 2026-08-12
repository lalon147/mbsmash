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

/**
 * A part number learned from an invoice is worth more than one order. Write it
 * back to the catalog so the next car needing this part opens with the number
 * already filled in, instead of someone reading it off a box a second time.
 *
 * Only ever fills a blank: a catalog number that is already set was put there
 * deliberately and is not overwritten by whatever was typed on one order. The
 * NOT EXISTS guards the catalog's unique-part-number index — two parts claiming
 * the same number is a mistake worth ignoring rather than a 500.
 */
async function teachCatalogPartNumber(client, order) {
  if (!order.catalog_part_id || !order.part_number) return;
  await client.query(
    `UPDATE parts_catalog p
        SET part_number = $1
      WHERE p.id = $2
        AND p.part_number IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM parts_catalog other
           WHERE other.part_number = $1 AND other.id <> p.id
        )`,
    [order.part_number, order.catalog_part_id],
  );
}

export async function PATCH(request, { params }) {
  const { id, orderId } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const body = await request.json();

  try {
    // Status and the plain columns are applied in one statement, because the
    // screen that marks a part received also asks what it cost — and that is
    // one thing that happened, not two. Splitting it would put two rows in the
    // history for a single tap, and leave the price behind if the second call
    // failed.
    const sets = [];
    const values = [];
    const changed = [];

    for (const field of Object.keys(EDITABLE)) {
      if (body[field] === undefined) continue;
      values.push(EDITABLE[field](body[field]));
      sets.push(`${field} = $${values.length}`);
      changed.push(field);
    }

    if (body.status !== undefined) {
      values.push(body.status);
      // Cast once and reuse: an untyped placeholder shared between the enum
      // column and the CASE comparison makes Postgres give up deducing a type.
      const status = `$${values.length}::order_status`;
      sets.push(`status = ${status}`);
      // received_date follows the status rather than being asked for. It is set
      // the first time a part arrives and kept if it is marked received again,
      // so a date entered for a part that turned up last month isn't quietly
      // moved to today. A part sent back was still received, so 'returned'
      // keeps its date; a part that goes back to 'ordered' or is cancelled was
      // not, and hanging on to the date leaves a cancelled part looking as
      // though it arrived.
      sets.push(
        `received_date = CASE
           WHEN ${status} = 'received'                 THEN coalesce(received_date, current_date)
           WHEN ${status} IN ('ordered', 'cancelled')  THEN NULL
           ELSE received_date END`,
      );
      changed.push('status');
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const updated = await withAudit(async client => {
      const { rows: [before] } = await client.query(
        `SELECT * FROM orders WHERE id = $1 AND vehicle_id = $2 FOR UPDATE`,
        [orderId, id],
      );
      if (!before) return null;

      values.push(orderId, id);
      const { rows: [after] } = await client.query(
        `UPDATE orders SET ${sets.join(', ')}
          WHERE id = $${values.length - 1} AND vehicle_id = $${values.length}
          RETURNING *`,
        values,
      );

      if (changed.includes('part_number')) await teachCatalogPartNumber(client, after);

      await logChange(client, {
        entityType: 'order', entityId: Number(orderId), vehicleId: Number(id),
        user, action: 'updated',
        changes: diffFields(before, after, changed),
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
