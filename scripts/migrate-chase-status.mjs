import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    console.log('Adding subagents column to chase_status...');
    await client.query(`
      ALTER TABLE chase_status 
      ADD COLUMN IF NOT EXISTS subagents JSONB DEFAULT '[]'::jsonb;
    `);

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
