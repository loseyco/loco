import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function checkCommands() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query("SELECT * FROM system_commands WHERE status = 'pending'");
        if (res.rows.length === 0) {
            console.log('No pending system commands.');
        } else {
            console.log('--- PENDING COMMANDS ---');
            console.table(res.rows);
        }
    } catch (err) {
        console.error('Error checking commands:', err.message);
    } finally {
        await client.end();
    }
}

checkCommands();
