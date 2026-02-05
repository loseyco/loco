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
      CREATE TABLE IF NOT EXISTS project_access (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'viewer',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, project_id)
      );

      ALTER TABLE project_access ENABLE ROW LEVEL SECURITY;
      
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all' AND tablename = 'project_access') THEN
              CREATE POLICY "service_role_all" ON project_access FOR ALL USING (true);
          END IF;
      END
      $$;

      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_see_own_access' AND tablename = 'project_access') THEN
              CREATE POLICY "users_see_own_access" ON project_access FOR SELECT USING (auth.uid() = user_id);
          END IF;
      END
      $$;

      DROP POLICY IF EXISTS "authenticated_select" ON projects;
      
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'access_via_project_access' AND tablename = 'projects') THEN
              CREATE POLICY "access_via_project_access" ON projects 
                FOR SELECT 
                USING (
                  EXISTS (
                    SELECT 1 FROM project_access 
                    WHERE project_access.project_id = projects.id 
                    AND project_access.user_id = auth.uid()
                  )
                  OR 
                  (SELECT (raw_user_meta_data->>'role') FROM auth.users WHERE id = auth.uid()) = 'admin'
                );
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
