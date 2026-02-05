import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function migrate() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Postgres.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS changelog (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT CHECK (category IN ('feature', 'fix', 'improvement')),
        version TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_changelog_created ON changelog(created_at DESC);
      ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all' AND tablename = 'changelog') THEN
              CREATE POLICY "service_role_all" ON changelog FOR ALL USING (true);
          END IF;
      END
      $$;

      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_select' AND tablename = 'changelog') THEN
              CREATE POLICY "authenticated_select" ON changelog FOR SELECT USING (true);
          END IF;
      END
      $$;
    `);
    console.log('Migration successfully executed.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
