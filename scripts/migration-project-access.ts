import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyMigration() {
  const sql = `
    -- Create project_access table to link users to specific projects
    CREATE TABLE IF NOT EXISTS project_access (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'viewer',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, project_id)
    );

    ALTER TABLE project_access ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "service_role_all" ON project_access FOR ALL USING (true);
    CREATE POLICY "users_see_own_access" ON project_access FOR SELECT USING (auth.uid() = user_id);

    -- Update projects RLS to respect project_access
    DROP POLICY IF EXISTS "authenticated_select" ON projects;
    CREATE POLICY "access_via_project_access" ON projects 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM project_access 
          WHERE project_access.project_id = projects.id 
          AND project_access.user_id = auth.uid()
        )
        OR 
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      );
  `;

  // We can't run this directly via the client without a custom RPC or direct Postgres connection.
  // For now, I'll log that this needs to be done.
  console.log('SQL Migration required for project-level security:');
  console.log(sql);
}

applyMigration();
