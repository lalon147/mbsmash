import { createHash } from 'node:crypto';
import pool from '@/lib/db';

// Photos are megabyte-sized data URLs. Storing them in the log would dwarf the
// rows they describe, so a short digest stands in: it keeps swapping one photo
// for another visible as a change (a plain 'set' marker would compare equal),
// while never putting the image itself in the trail. The UI renders these as
// "Photo added / replaced / removed" and never prints the digest.
const OPAQUE_FIELDS = new Set(['photo', 'data_url', 'invoice_photo']);

// Normalise to the text the change_log stores, so that 340 and '340.00' and
// Number('340') don't read as three different values in the history.
function toText(field, value) {
  if (value === null || value === undefined || value === '') return null;
  if (OPAQUE_FIELDS.has(field)) {
    return createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
  }
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/**
 * The fields that actually changed, comparing the row before the write with the
 * row after it. Only `fields` are considered — a route passes the keys the
 * request asked to change, so a column the database touched on its own (say
 * received_date following a status flip) doesn't show up as a user's edit.
 */
export function diffFields(before, after, fields) {
  const changes = [];
  for (const field of fields) {
    const oldValue = toText(field, before?.[field]);
    const newValue = toText(field, after?.[field]);
    if (oldValue !== newValue) changes.push({ field, oldValue, newValue });
  }
  return changes;
}

/**
 * Append to the audit trail. Pass the same `client` the write ran on, inside
 * the same transaction: a change that commits without its log entry is exactly
 * the change nobody can account for later.
 *
 * `action` is 'created' | 'updated' | 'deleted'. 'updated' writes one row per
 * changed field and is a no-op when `changes` is empty. The others write a
 * single row with no field.
 */
export async function logChange(client, { entityType, entityId, vehicleId, user, action, changes = [] }) {
  const db = client || pool;
  const userId = user?.id ?? null;

  if (action !== 'updated') {
    await db.query(
      `INSERT INTO change_log (entity_type, entity_id, vehicle_id, user_id, action)
       VALUES ($1, $2, $3, $4, $5)`,
      [entityType, entityId, vehicleId ?? null, userId, action],
    );
    return;
  }

  // changed_at defaults to now(), which is the *transaction* start time, so
  // these separate inserts all land on the same timestamp and the UI can group
  // them back into one history entry ("Lalon changed price and quantity").
  for (const { field, oldValue, newValue } of changes) {
    await db.query(
      `INSERT INTO change_log (entity_type, entity_id, vehicle_id, user_id, action, field, old_value, new_value)
       VALUES ($1, $2, $3, $4, 'updated', $5, $6, $7)`,
      [entityType, entityId, vehicleId ?? null, userId, field, oldValue, newValue],
    );
  }
}

/**
 * Run `fn` in a transaction and hand it a client. The audit row and the change
 * it describes commit together or not at all.
 */
export async function withAudit(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
