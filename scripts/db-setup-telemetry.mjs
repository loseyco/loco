import pkg from 'pg';
const { Client } = pkg;
const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function patch() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Postgres.');

    await client.query(`
      ALTER TABLE systems ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
    `);
    
    console.log('Systems table updated with metadata column.');

  } catch (err) {
    console.error('Patch error:', err);
  } finally {
    await client.end();
  }
}
patch();
