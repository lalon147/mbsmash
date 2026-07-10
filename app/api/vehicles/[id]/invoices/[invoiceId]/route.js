import { NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange, diffFields } from '@/lib/audit';

const MAX_DATA_URL_LENGTH = 2_000_000;

const EDITABLE = {
  invoice_type_id: v => v || null,
  amount:          v => (v === '' || v === null ? null : Number(v)),
  invoice_date:    v => v || null,
  photo:           v => v || null,
};

export async function PATCH(request, { params }) {
  const { id, invoiceId } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { photo } = body;

    if (photo && (!photo.startsWith('data:image/') || photo.length > MAX_DATA_URL_LENGTH)) {
      return NextResponse.json({ error: 'That file is not a usable photo.' }, { status: 400 });
    }

    // `photo: null` clears the photo, so a field counts as edited by being
    // present in the body. JSON can't carry undefined, so presence is enough.
    const fields = Object.keys(EDITABLE).filter(f => f in body);
    if (fields.length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const updated = await withAudit(async client => {
      const { rows: [before] } = await client.query(
        `SELECT * FROM vehicle_invoices WHERE id = $1 AND vehicle_id = $2 FOR UPDATE`,
        [invoiceId, id],
      );
      if (!before) return null;

      const values = fields.map(f => EDITABLE[f](body[f]));
      const sets = fields.map((f, i) => `${f} = $${i + 1}`);
      values.push(invoiceId, id);

      const { rows: [after] } = await client.query(
        `UPDATE vehicle_invoices SET ${sets.join(', ')}
          WHERE id = $${fields.length + 1} AND vehicle_id = $${fields.length + 2}
          RETURNING *,
            (SELECT name FROM invoice_types WHERE id = vehicle_invoices.invoice_type_id) AS type_name`,
        values,
      );

      await logChange(client, {
        entityType: 'invoice', entityId: Number(invoiceId), vehicleId: Number(id),
        user, action: 'updated',
        changes: diffFields(before, after, fields),
      });
      return after;
    });

    if (!updated) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/vehicles/[id]/invoices/[invoiceId] failed:', err);
    return NextResponse.json(
      { error: 'Could not save changes. Please try again.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const { id, invoiceId } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    await withAudit(async client => {
      const { rowCount } = await client.query(
        'DELETE FROM vehicle_invoices WHERE id = $1 AND vehicle_id = $2',
        [invoiceId, id],
      );
      // Nothing deleted means nothing happened — don't log a phantom change.
      if (rowCount === 0) return;

      await logChange(client, {
        entityType: 'invoice', entityId: Number(invoiceId), vehicleId: Number(id),
        user, action: 'deleted',
      });
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/vehicles/[id]/invoices/[invoiceId] failed:', err);
    return NextResponse.json(
      { error: 'Could not delete the invoice. Please try again.' },
      { status: 500 },
    );
  }
}
