import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: tasks } = await supabase.from('tasks').select('*').order('priority', { ascending: false });
  console.log('Tasks:', JSON.stringify(tasks, null, 2));
}

check();
