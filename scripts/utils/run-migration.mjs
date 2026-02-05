import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

// Use connection string from SECRETS/Detected
const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function runMigration() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to Database.');

        const sql = `
        -- 1. ADD OWNERSHIP TO PROJECTS
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

        -- 2. CREATE SYSTEM COMMANDS QUEUE
        CREATE TABLE IF NOT EXISTS system_commands (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          target_system TEXT NOT NULL DEFAULT 'main-pc',
          command TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          executed_at TIMESTAMP WITH TIME ZONE,
          result_log TEXT
        );

        -- 3. ENABLE REALTIME
        -- Note: This requires the publication to exist. Usually 'supabase_realtime'
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
            -- Check if table is already in publication
            IF NOT EXISTS (
                SELECT 1 FROM pg_publication_tables 
                WHERE pubname = 'supabase_realtime' 
                AND schemaname = 'public' 
                AND tablename = 'system_commands'
            ) THEN
                ALTER PUBLICATION supabase_realtime ADD TABLE system_commands;
                RAISE NOTICE 'Added system_commands to supabase_realtime publication.';
            ELSE
                RAISE NOTICE 'system_commands already in supabase_realtime publication.';
            END IF;
          END IF;
        END $$;
        `;

        await client.query(sql);
        console.log('Migration completed successfully.');

    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

runMigration();
