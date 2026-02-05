import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  console.log('🛠️ Creating telemetry tables...');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS api_usage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agent_id TEXT,
      model TEXT,
      input_tokens BIGINT,
      output_tokens BIGINT,
      total_tokens BIGINT,
      status TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS agent_status (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agent_id TEXT UNIQUE,
      current_goal TEXT,
      status_text TEXT,
      last_heartbeat TIMESTAMPTZ DEFAULT now(),
      active_subagents INTEGER DEFAULT 0,
      blocked_reason TEXT,
      delays JSONB,
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS system_stats (
      hostname TEXT PRIMARY KEY,
      cpu_usage FLOAT,
      memory_usage FLOAT,
      uptime_seconds BIGINT,
      last_seen TIMESTAMPTZ DEFAULT now()
    );

    -- Enable Realtime
    BEGIN;
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'api_usage') THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE api_usage;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'agent_status') THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE agent_status;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'system_stats') THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE system_stats;
        END IF;
      END $$;
    COMMIT;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Error executing SQL:', error.message);
  } else {
    console.log('✅ Telemetry tables created.');
  }
}

setup();
