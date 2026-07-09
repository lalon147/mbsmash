import { Pool, types } from 'pg';

// A DATE has no time and no zone, but node-postgres turns it into a JS Date at
// *local* midnight. Serialised to JSON that becomes the previous day for any
// timezone ahead of UTC — in AEST, 2026-07-09 arrives at the client as
// 2026-07-08. Hand DATE columns through as plain 'YYYY-MM-DD' strings instead,
// which is what every date input and .slice(0, 10) in the UI already expects.
// (1082 is the DATE type oid. TIMESTAMPTZ is unaffected and still parses.)
types.setTypeParser(1082, value => value);

// Singleton pool — prevents multiple connections during Next.js hot reload
if (!global._pgPool) {
  global._pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
}

export default global._pgPool;
