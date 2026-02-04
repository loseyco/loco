import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
  console.log('🛠️ Creating systems table...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS systems (
          id text PRIMARY KEY,
          hostname text,
          cpu_usage integer,
          memory_usage integer,
          uptime_seconds bigint,
          last_seen timestamptz DEFAULT now()
      );
      -- Try to enable realtime
      BEGIN;
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'systems') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE systems;
          END IF;
        END $$;
      COMMIT;
    `
  });

  if (error) {
    // If rpc fails, it might be because exec_sql doesn't exist.
    // In that case, we have to use the browser or ask the user.
    console.error('❌ Error creating table via RPC:', error.message);
    console.log('Attempting alternative via direct SQL if possible...');
  } else {
    console.log('✅ Systems table created and realtime enabled.');
  }
}

createTable();
