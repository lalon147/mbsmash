import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';

// An email address good enough to hand to a mail app: something, an @, a dot in
// the domain. Deliberately loose — the point is to catch a phone number typed
// into the email box, not to adjudicate what RFC 5322 permits.
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const { name, phone, email } = await request.json();

    if (name !== undefined && !name?.trim()) {
      return NextResponse.json({ error: 'A supplier needs a name.' }, { status: 400 });
    }
    // An email that never reaches anyone is worse than a blank one: the order
    // screen would offer to send to it and the parts would quietly not arrive.
    const cleanEmail = email?.trim() || null;
    if (cleanEmail && !LOOKS_LIKE_EMAIL.test(cleanEmail)) {
      return NextResponse.json({ error: 'That does not look like an email address.' }, { status: 400 });
    }

    const { rows: [updated] } = await pool.query(
      `UPDATE dealerships
          SET name  = coalesce($2, name),
              phone = $3,
              email = $4
        WHERE id = $1
        RETURNING id, name, phone, email`,
      [id, name?.trim() ?? null, phone?.trim() || null, cleanEmail],
    );
    if (!updated) return NextResponse.json({ error: 'No such supplier.' }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    // A name collides with another supplier's — the table keeps names unique so
    // the PT / Preston Toyota split can't come back a rename at a time.
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Another supplier already has that name.' }, { status: 409 });
    }
    console.error('PATCH /api/dealerships/[id] failed:', err);
    return NextResponse.json(
      { error: 'Could not save the supplier. Please try again.' },
      { status: 500 },
    );
  }
}
