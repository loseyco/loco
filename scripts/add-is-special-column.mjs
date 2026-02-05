import pkg from 'pg';
const { Client } = pkg;
const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function addColumn() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Postgres.');

    await client.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS is_special BOOLEAN DEFAULT false;
    `);
    console.log('Column is_special added to tasks table.');

  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await client.end();
  }
}
addColumn();
