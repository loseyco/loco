import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'site/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTasksAndFinance() {
  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .gte('updated_at', '2026-02-05T00:00:00Z');

  const { data: invoices, error: invError } = await supabase
    .from('invoices')
    .select('*')
    .gte('updated_at', '2026-02-05T00:00:00Z');

  if (taskError) console.error('Task Error:', taskError);
  if (invError) console.error('Invoice Error:', invError);

  console.log('--- TASKS UPDATED TODAY ---');
  tasks?.forEach(t => console.log(`- [${t.status}] ${t.title} (Priority: ${t.priority})`));

  console.log('\n--- INVOICES UPDATED TODAY ---');
  invoices?.forEach(i => console.log(`- ${i.client_name || 'Unknown'}: $${i.amount} (${i.status})`));
}

checkTasksAndFinance();
