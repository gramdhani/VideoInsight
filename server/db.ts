import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create postgres client
  throw new Error('DATABASE_URL or SUPABASE_DB_URL must be set. Did you forget to provision a database?');
export const db = drizzle(client, { schema });