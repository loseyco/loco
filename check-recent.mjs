import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/LoCoOS/.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRecent() {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .gte('updated_at', hourAgo);

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .gte('created_at', hourAgo);

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', hourAgo.split('T')[0]); // Expenses usually just date

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .gte('created_at', hourAgo)
    .limit(5);

  console.log(JSON.stringify({ tasks, invoices, expenses, logs }, null, 2));
}

checkRecent();
