import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: usage } = await supabase.from('api_usage').select('*').order('created_at', { ascending: false }).limit(10);
  console.log('API Usage:', JSON.stringify(usage, null, 2));
}

check();
