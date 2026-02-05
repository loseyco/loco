import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkChaseStatus() {
  const { data, error } = await supabase.from('chase_status').select('*').single();
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Chase Status:', JSON.stringify(data, null, 2));
  }
}

checkChaseStatus();
