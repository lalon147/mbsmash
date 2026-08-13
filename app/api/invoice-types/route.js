import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT * FROM invoice_types WHERE active = true ORDER BY sort_order, name'
  );
  return NextResponse.json(rows);
}

export async function POST(request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'A name is required.' }, { status: 400 });
    }

    const created = await withAudit(async client => {
      // Adding a type that exists but was switched off brings it back rather
      // than failing on the unique index. `xmax = 0` is true only for a row
      // this statement actually inserted, which is how the audit entry tells a
      // brand-new type from a revived one instead of calling both 'created'.
      const { rows: [type] } = await client.query(
        `INSERT INTO invoice_types (name, sort_order)
         VALUES ($1, (SELECT coalesce(max(sort_order), 0) + 1 FROM invoice_types))
         ON CONFLICT (name) DO UPDATE SET active = true
         RETURNING *, (xmax = 0) AS inserted`,
        [name.trim()],
      );

      await logChange(client, {
        entityType: 'invoice_type',
        entityId: type.id,
        user,
        action: type.inserted ? 'created' : 'updated',
        changes: type.inserted ? [] : [{ field: 'active', oldValue: 'false', newValue: 'true' }],
      });

      delete type.inserted;
      return type;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('POST /api/invoice-types failed:', err);
    return NextResponse.json(
      { error: 'Could not add that invoice type. Please try again.' },
      { status: 500 }
    );
  }
}
