import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'site/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('--- Current Status ---');
  const { data: status, error: sError } = await supabase
    .from('chase_status')
    .select('*')
    .limit(1)
    .single();

  if (sError) console.error('Error fetching status:', sError);
  else console.log(JSON.stringify(status, null, 2));

  console.log('\n--- Pending Tasks ---');
  const { data: tasks, error: tError } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false });

  if (tError) console.error('Error fetching tasks:', tError);
  else {
    tasks.forEach(t => console.log(`- [P${t.priority}] ${t.title}`));
  }
}

check();
