import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const MAX_DATA_URL_LENGTH = 2_000_000;

export async function PATCH(request, { params }) {
  const { id, invoiceId } = await params;
  try {
    const body = await request.json();
    const { invoice_type_id, amount, invoice_date, photo } = body;

    if (photo && (!photo.startsWith('data:image/') || photo.length > MAX_DATA_URL_LENGTH)) {
      return NextResponse.json({ error: 'That file is not a usable photo.' }, { status: 400 });
    }

    const sets = [];
    const values = [];
    let i = 1;
    if (invoice_type_id !== undefined) { sets.push(`invoice_type_id = $${i++}`); values.push(invoice_type_id || null); }
    if (amount !== undefined)          { sets.push(`amount = $${i++}`);          values.push(amount === '' || amount === null ? null : Number(amount)); }
    if (invoice_date !== undefined)    { sets.push(`invoice_date = $${i++}`);    values.push(invoice_date || null); }
    if ('photo' in body)               { sets.push(`photo = $${i++}`);           values.push(photo || null); }

    if (sets.length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    values.push(invoiceId, id);
    const { rows } = await pool.query(
      `UPDATE vehicle_invoices SET ${sets.join(', ')}
       WHERE id = $${i++} AND vehicle_id = $${i}
       RETURNING *,
         (SELECT name FROM invoice_types WHERE id = vehicle_invoices.invoice_type_id) AS type_name`,
      values
    );
    if (!rows[0]) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/vehicles/[id]/invoices/[invoiceId] failed:', err);
    return NextResponse.json(
      { error: 'Could not save changes. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id, invoiceId } = await params;
  try {
    await pool.query(
      'DELETE FROM vehicle_invoices WHERE id = $1 AND vehicle_id = $2',
      [invoiceId, id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/vehicles/[id]/invoices/[invoiceId] failed:', err);
    return NextResponse.json(
      { error: 'Could not delete the invoice. Please try again.' },
      { status: 500 }
    );
  }
}
