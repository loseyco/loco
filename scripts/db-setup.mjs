import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setup() {
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
      last_heartbeat TIMESTAMPTZ,
      active_subagents INTEGER DEFAULT 0,
      blocked_reason TEXT,
      delays JSONB,
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Ensure realtime is enabled
    ALTER PUBLICATION supabase_realtime ADD TABLE api_usage;
    ALTER PUBLICATION supabase_realtime ADD TABLE agent_status;
  `;

  // We can't run raw SQL via the client easily unless we have a specific RPC
  // So we'll try to insert a dummy row to see if the table exists, 
  // or just rely on the user having created it via the UI if this fails.
  // Actually, I can use a sub-agent to navigate the Supabase UI if needed.
  
  console.log('Setup script ready. Please run the SQL in Supabase dashboard if tables are missing.');
}

setup();
