import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRealtime() {
    const { data, error } = await supabase.rpc('get_realtime_tables'); // Check for specific RPC
    if (error) {
        console.log('Realtime check RPC not found.');
    } else {
        console.log('Realtime tables:', data);
    }
}

checkRealtime();
