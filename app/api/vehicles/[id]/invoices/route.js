import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Photos are resized client-side to ~1280px JPEG; anything bigger than this
// means the resize was skipped and the row would bloat the table.
const MAX_DATA_URL_LENGTH = 2_000_000;

export async function GET(request, { params }) {
  const { id } = await params;
  const { rows } = await pool.query(
    `SELECT vi.*, it.name AS type_name
     FROM vehicle_invoices vi
     LEFT JOIN invoice_types it ON it.id = vi.invoice_type_id
     WHERE vi.vehicle_id = $1
     ORDER BY vi.invoice_date DESC NULLS LAST, vi.created_at DESC`,
    [id]
  );
  return NextResponse.json(rows);
}

export async function POST(request, { params }) {
  const { id } = await params;
  try {
    const { invoice_type_id, amount, invoice_date, photo } = await request.json();

    if (photo && (!photo.startsWith('data:image/') || photo.length > MAX_DATA_URL_LENGTH)) {
      return NextResponse.json({ error: 'That file is not a usable photo.' }, { status: 400 });
    }
    if (!invoice_type_id) {
      return NextResponse.json({ error: 'Pick an invoice type.' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO vehicle_invoices (vehicle_id, invoice_type_id, amount, invoice_date, photo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *,
         (SELECT name FROM invoice_types WHERE id = $2) AS type_name`,
      [
        id,
        invoice_type_id,
        amount === '' || amount == null ? null : Number(amount),
        invoice_date || null,
        photo || null,
      ]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('POST /api/vehicles/[id]/invoices failed:', err);
    return NextResponse.json(
      { error: 'Could not save the invoice. Please try again.' },
      { status: 500 }
    );
  }
}
