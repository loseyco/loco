import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTables() {
    const { data, error } = await supabase.rpc('list_tables_v2'); // If RPC exists
    if (error) {
        // Fallback: Check common tables
        const tables = ['tasks', 'leads', 'projects', 'task_notes', 'changelog', 'finance', 'invoices', 'project_access', 'status_telemetry', 'usage_logs'];
        console.log('--- TABLES CHECK ---');
        for (const t of tables) {
            const { error: e } = await supabase.from(t).select('id').limit(1);
            console.log(`${t}: ${e ? '❌ (' + e.message + ')' : '✅'}`);
        }
    } else {
        console.log(data);
    }
}

listTables();
