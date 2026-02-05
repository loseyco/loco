import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('systems').select('*').eq('id', 'main-pc').single();
  if (error) console.error(error);
  else console.log('Main PC Stats:', JSON.stringify(data, null, 2));
}

check();
