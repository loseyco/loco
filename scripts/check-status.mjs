import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'site/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('chase_status')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching status:', error);
  } else {
    console.log(JSON.stringify([data], null, 2));
  }
}

check();
