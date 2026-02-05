const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'site/.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStatus() {
  const { data: tasks, error: taskError } = await supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(5);
  const { data: expenses } = await supabase.from('expenses').select('*').order('created_at', { ascending: false }).limit(5);
  const { data: invoices } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(5);
  
  console.log(JSON.stringify({ tasks, taskError, expenses, invoices }, null, 2));
}

checkStatus();
