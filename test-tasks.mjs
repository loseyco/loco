import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/LoCoOS/.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTasks() {
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) console.log('Error:', error);
  else console.log('Tasks Count:', data.length);
}

checkTasks();
