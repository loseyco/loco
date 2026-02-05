import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/LoCoOS/.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRecentTasks() {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase.from('tasks').select('*').gte('created_at', hourAgo);
  if (error) console.log('Error:', error);
  else console.log(JSON.stringify(data, null, 2));
}

checkRecentTasks();
