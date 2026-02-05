import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSql(sql) {
    console.log('Running SQL...');
    const { data, error } = await supabase.rpc('run_sql', { sql_query: sql });
    
    if (error) {
        console.error('Error running SQL:', error);
        // Fallback for direct table creation if RPC fails or is named differently
        if (error.message.includes('run_sql')) {
           console.log('Hint: The "run_sql" RPC might not be named "run_sql". Checking for alternatives.');
        }
    } else {
        console.log('SQL Result:', data);
    }
}

const sql = `
-- 1. ADD OWNERSHIP TO PROJECTS
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- 2. CREATE SYSTEM COMMANDS QUEUE
CREATE TABLE IF NOT EXISTS system_commands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_system TEXT NOT NULL DEFAULT 'main-pc',
  command TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  executed_at TIMESTAMP WITH TIME ZONE,
  result_log TEXT
);

-- 3. ENABLE REALTIME
-- Note: This requires the publication to exist. Usually 'supabase_realtime'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE system_commands;
  END IF;
END $$;
`;

runSql(sql);
