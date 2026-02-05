import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRpc() {
    const { data, error } = await supabase.rpc('get_rpc_names');
    if (error) {
        console.error('Error fetching RPCs:', error);
    } else {
        console.log('Available RPCs:', data);
    }
}

checkRpc();
