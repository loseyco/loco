import postgres from 'postgres';
import 'dotenv/config';

// Note: Using environment variables from site/.env.local
const sql = postgres(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('Starting migration for project_access...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS project_access (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'viewer',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, project_id)
      );
    `;

    await sql`ALTER TABLE project_access ENABLE ROW LEVEL SECURITY;`;
    
    // We use do blocks for policies to avoid "already exists" errors if re-run
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'project_access' AND policyname = 'service_role_all'
        ) THEN
          CREATE POLICY "service_role_all" ON project_access FOR ALL USING (true);
        END IF;
      END
      $$;
    `;

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'project_access' AND policyname = 'users_see_own_access'
        ) THEN
          CREATE POLICY "users_see_own_access" ON project_access FOR SELECT USING (auth.uid() = user_id);
        END IF;
      END
      $$;
    `;

    console.log('Updating projects RLS...');
    
    await sql`DROP POLICY IF EXISTS "authenticated_select" ON projects;`;
    
    await sql`
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
    `;

    console.log('Migration successfully executed.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.end();
  }
}

migrate();
