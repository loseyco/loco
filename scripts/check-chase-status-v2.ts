import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkChaseStatusColumns() {
  const { data, error } = await supabase.from('chase_status').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns for chase_status:', Object.keys(data[0] || {}));
    console.log('Data:', data[0]);
  }
}

checkChaseStatusColumns();
