import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRecent() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const tables = ['tasks', 'leads', 'agent_sessions', 'memory_entries', 'invoices', 'expenses', 'projects', 'time_entries'];
    const results = {};

    for (const table of tables) {
        try {
            // Some tables might only have created_at
            const { data, error } = await supabase.from(table).select('*').gt('created_at', oneHourAgo).limit(5);
            if (data && data.length > 0) results[table] = data;
        } catch (e) {
            // Ignore missing tables
        }
    }
    
    console.log(JSON.stringify(results, null, 2));
}

checkRecent();
