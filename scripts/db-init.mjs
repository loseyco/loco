import pkg from 'pg';
const { Client } = pkg;
const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function setup() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Postgres.');

    await client.query(`
      DROP TABLE IF EXISTS api_usage;
      DROP TABLE IF EXISTS agent_status;

      CREATE TABLE api_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id TEXT,
        model TEXT,
        input_tokens BIGINT,
        output_tokens BIGINT,
        total_tokens BIGINT,
        status TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE agent_status (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id TEXT UNIQUE,
        current_goal TEXT,
        status_text TEXT,
        last_heartbeat TIMESTAMPTZ,
        active_subagents INTEGER DEFAULT 0,
        blocked_reason TEXT,
        delays JSONB,
        staff_online BOOLEAN DEFAULT false,
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('Tables created.');

    // Enable realtime
    await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
                CREATE PUBLICATION supabase_realtime;
            END IF;
            ALTER PUBLICATION supabase_realtime ADD TABLE api_usage;
            ALTER PUBLICATION supabase_realtime ADD TABLE agent_status;
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Realtime setup skipped or failed: %', SQLERRM;
        END $$;
    `);
    console.log('Realtime configured.');

  } catch (err) {
    console.error('Setup error:', err);
  } finally {
    await client.end();
  }
}
setup();
