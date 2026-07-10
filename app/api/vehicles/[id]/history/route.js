import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// The whole audit trail for one car — its parts, invoices and photos included.
// Fetched once per vehicle rather than per row, so opening a car with thirty
// parts is still one query.
export async function GET(request, { params }) {
  const { id } = await params;
  const { rows } = await pool.query(
    `SELECT cl.id, cl.entity_type, cl.entity_id, cl.action,
            cl.field, cl.old_value, cl.new_value, cl.changed_at,
            u.username, u.display_name
     FROM change_log cl
     LEFT JOIN users u ON u.id = cl.user_id
     WHERE cl.vehicle_id = $1
     ORDER BY cl.changed_at DESC, cl.id DESC`,
    [id],
  );
  return NextResponse.json(rows);
}
