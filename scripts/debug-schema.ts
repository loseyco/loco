import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'systems' });
  if (error) {
    // If RPC doesn't exist, try a simple select
    const { data: cols, error: colError } = await supabase.from('systems').select('*').limit(1);
    if (colError) {
      console.error('Error:', colError);
    } else {
      console.log('Columns:', Object.keys(cols[0] || {}));
    }
  } else {
    console.log('Schema:', data);
  }
}

checkSchema();
