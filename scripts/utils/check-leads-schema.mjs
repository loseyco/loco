import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function checkLeadsSchema() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'leads'
        `);
        console.log('Leads Schema:');
        console.table(res.rows);
    } catch (err) {
        console.error('Schema check failed:', err.message);
    } finally {
        await client.end();
    }
}

checkLeadsSchema();
