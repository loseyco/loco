import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateTasks() {
  const completedTaskIds = [
    '2f68b0dd-622d-4816-986b-28ae9c899c3c' // Remove demo data
  ];

  for (const id of completedTaskIds) {
    await supabase.from('tasks').update({ status: 'completed' }).eq('id', id);
  }

  console.log('Updated tasks to completed.');
}

updateTasks();
