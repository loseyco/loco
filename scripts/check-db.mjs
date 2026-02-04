import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: projects } = await supabase.from('projects').select('*');
  console.log('Projects:', JSON.stringify(projects, null, 2));

  const { data: tables } = await supabase.rpc('get_tables'); // If exists
  console.log('Tables check done.');
}

check();
