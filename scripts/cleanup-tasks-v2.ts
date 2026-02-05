import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanupTasks() {
  const completedTaskIds = [
    '9ee41c3c-e3b8-47cb-a346-6be876263eab', // Staff PM2 Dashboard
    '0fe57f4e-bab2-4dd7-8fb4-e4588d33c23a'  // Implement 'Special Tasks' View
  ];

  for (const id of completedTaskIds) {
    await supabase.from('tasks').update({ status: 'completed' }).eq('id', id);
  }

  console.log('Cleaned up completed tasks.');
}

cleanupTasks();
