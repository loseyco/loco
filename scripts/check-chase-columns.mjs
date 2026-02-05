import pkg from 'pg';
const { Client } = pkg;
const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function check() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'chase_status'");
    console.log('Chase Status Columns:', res.rows.map(r => r.column_name).join(', '));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
check();
