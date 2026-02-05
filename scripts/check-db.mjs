import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: status } = await supabase.from('chase_status').select('*');
  console.log('Chase Status:', JSON.stringify(status, null, 2));
}

check();
