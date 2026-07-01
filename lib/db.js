import { Pool } from 'pg';

// Singleton pool — prevents multiple connections during Next.js hot reload
if (!global._pgPool) {
  global._pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
}

export default global._pgPool;
