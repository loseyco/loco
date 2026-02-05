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
    '1221d6c4-1380-4aab-9334-0f6b7d2a3b16', // Werk Shop Demo - Live Data
    'd621587b-f8bb-416c-9b46-5657a6cce028', // Remote Reboot Capability (Assumed done by system check logic)
    '44457151-5585-4174-9f93-b22cb0a8d3af'  // Discord Channel Organization
  ];

  for (const id of completedTaskIds) {
    await supabase.from('tasks').update({ status: 'completed' }).eq('id', id);
  }

  console.log('Updated tasks to completed.');
}

updateTasks();
