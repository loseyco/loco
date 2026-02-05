import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  const { data: cols, error: colError } = await supabase.from('activity_logs').select('*').limit(1);
  if (colError) {
    console.error('Error:', colError);
  } else {
    console.log('Columns:', Object.keys(cols[0] || {}));
  }
}

checkColumns();
