import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('--- Systems ---');
  const { data: stats } = await supabase.from('systems').select('*').order('last_seen', { ascending: false }).limit(1);
  console.log(stats);

  console.log('\n--- API Usage ---');
  const { data: usage } = await supabase.from('api_usage').select('*').order('recorded_at', { ascending: false }).limit(5);
  console.log(usage);

  console.log('\n--- Chase Status ---');
  const { data: status } = await supabase.from('chase_status').select('*').order('updated_at', { ascending: false }).limit(1);
  console.log(status);
}

check();
