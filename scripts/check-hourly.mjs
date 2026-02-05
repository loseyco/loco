import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'site/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecent() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .gte('created_at', oneHourAgo);

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .gte('created_at', oneHourAgo);

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .gte('created_at', oneHourAgo);

  console.log('--- CHANGES IN LAST HOUR ---');
  console.log('Tasks:', tasks?.length || 0);
  tasks?.forEach(t => console.log(`- [${t.status}] ${t.title}`));

  console.log('Invoices:', invoices?.length || 0);
  invoices?.forEach(i => console.log(`- $${i.amount} (${i.status})`));

  console.log('Expenses:', expenses?.length || 0);
  expenses?.forEach(e => console.log(`- $${e.amount} (${e.description})`));
}

checkRecent();
