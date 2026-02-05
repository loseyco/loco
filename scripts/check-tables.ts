import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables');
  if (error) {
    // If RPC doesn't exist, try a simple query to see if api_usage exists
    const { error: tableError } = await supabase.from('api_usage').select('*').limit(1);
    if (tableError) {
      console.log('api_usage table does not exist or error:', tableError.message);
    } else {
      console.log('api_usage table exists.');
    }
  } else {
    console.log('Tables:', data);
  }
}

listTables();
