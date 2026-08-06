import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Same idea as the makes list: the models this shop actually sees come first.
// For Toyota that puts Camry and Kluger at the top, which is most of the work,
// and leaves the rest of the range below in alphabetical order.
export async function GET(request, { params }) {
  const { id } = await params;
  const { rows } = await pool.query(`
    SELECT mo.id, mo.make_id, mo.name
    FROM models mo
    LEFT JOIN vehicles v ON v.model_id = mo.id
    WHERE mo.make_id = $1
    GROUP BY mo.id, mo.make_id, mo.name
    ORDER BY count(v.id) DESC, mo.name
  `, [id]);
  return NextResponse.json(rows);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const { name } = await request.json();
  const { rows } = await pool.query(
    `INSERT INTO models (make_id, name) VALUES ($1,$2) RETURNING id, make_id, name`,
    [id, name.trim()]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
