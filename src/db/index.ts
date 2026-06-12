import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

// Function to create a new connection pool using Object Method.
export const createPool = () => {
  const host = process.env.SQL_HOST || 'localhost';
  const user = process.env.SQL_USER;
  const password = process.env.SQL_PASSWORD;
  const database = process.env.SQL_DB_NAME;

  // Let's check if the Cloud SQL environment variables are provided.
  if (!user || !password || !database) {
    console.warn("Cloud SQL configuration variables (SQL_USER, SQL_PASSWORD, SQL_DB_NAME) are missing. Fallback configuration will be used.");
  }

  return new Pool({
    host: host,
    user: user || 'postgres',
    password: password || 'postgres',
    database: database || 'postgres',
    connectionTimeoutMillis: 15000,
  });
};

let poolInstance: pg.Pool | null = null;
let dbInstance: any = null;

export function getDb() {
  if (!dbInstance) {
    poolInstance = createPool();
    poolInstance.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
    dbInstance = drizzle(poolInstance, { schema });
  }
  return dbInstance;
}

export function getPool() {
  if (!poolInstance) {
    getDb();
  }
  return poolInstance!;
}
