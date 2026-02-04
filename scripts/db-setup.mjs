import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('🐘 Connected to Postgres.');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS systems (
          id text PRIMARY KEY,
          hostname text,
          cpu_usage integer,
          memory_usage integer,
          uptime_seconds bigint,
          last_seen timestamptz DEFAULT now()
      );
    `);
    console.log('✅ Table "systems" verified.');

    // Check if table is in publication
    const pubCheck = await client.query(`
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'systems';
    `);

    if (pubCheck.rowCount === 0) {
      await client.query('ALTER PUBLICATION supabase_realtime ADD TABLE systems;');
      console.log('✅ Realtime enabled for "systems".');
    } else {
      console.log('ℹ️ Realtime already enabled for "systems".');
    }

    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('🔄 PostgREST schema reload notified.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
