import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function updateSchema() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('Adding progress_percent to projects...');
    await client.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS estimated_completion DATE,
      ADD COLUMN IF NOT EXISTS make TEXT,
      ADD COLUMN IF NOT EXISTS model TEXT,
      ADD COLUMN IF NOT EXISTS year TEXT,
      ADD COLUMN IF NOT EXISTS chassis_number TEXT,
      ADD COLUMN IF NOT EXISTS owner_name TEXT;
    `);

    console.log('Creating project_milestones table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending', -- pending, current, completed
        target_date DATE,
        completed_at TIMESTAMP WITH TIME ZONE,
        details JSONB DEFAULT '[]',
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Schema updated successfully!');
  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    await client.end();
  }
}

updateSchema();
