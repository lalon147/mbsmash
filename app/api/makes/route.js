import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';

// Busiest make first — the shop books in far more Toyotas than anything else,
// so an alphabetical list buries the usual answer behind Audi and BMW. Makes
// nobody has brought in yet still appear, alphabetically, after the ones that
// have. The order follows the work: it shifts on its own as the mix changes.
export async function GET() {
  const { rows } = await pool.query(`
    SELECT mk.id, mk.name
    FROM makes mk
    LEFT JOIN vehicles v ON v.make_id = mk.id
    GROUP BY mk.id, mk.name
    ORDER BY count(v.id) DESC, mk.name
  `);
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
      const { rows: [make] } = await client.query(
        `INSERT INTO makes (name) VALUES ($1) RETURNING id, name`,
        [name.trim()],
      );
      await logChange(client, {
        entityType: 'make', entityId: make.id, user, action: 'created',
      });
      return make;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('POST /api/makes failed:', err);
    return NextResponse.json(
      { error: 'Could not add that make. Please try again.' },
      { status: 500 },
    );
  }
}
