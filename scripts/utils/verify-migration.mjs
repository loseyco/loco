import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function verify() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        
        console.log('--- VERIFYING SCHEMA ---');
        
        // Check projects column
        const colRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'owner_id'
        `);
        console.log('projects.owner_id:', colRes.rows.length > 0 ? '✅ EXISTS' : '❌ MISSING');

        // Check system_commands table
        const tabRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'system_commands'
        `);
        console.log('system_commands table:', tabRes.rows.length > 0 ? '✅ EXISTS' : '❌ MISSING');

        // Check publication
        const pubRes = await client.query(`
            SELECT * FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'system_commands'
        `);
        console.log('system_commands in realtime publication:', pubRes.rows.length > 0 ? '✅ YES' : '❌ NO');

    } catch (err) {
        console.error('Verification failed:', err.message);
    } finally {
        await client.end();
    }
}

verify();
