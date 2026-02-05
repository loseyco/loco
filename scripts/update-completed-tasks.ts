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
    'dcd4e5a8-d8c6-414f-a9c0-fb0ae8373688', // start/stop/priority UI
    'c9457396-cba4-4a55-90b3-068006546161', // pause/do now buttons
    '8ce4d722-5701-41f2-8051-2a16a6ec9dd4', // priority dropdown
    '649d9c66-4e24-470d-8b6a-0b615eaf35ba'  // multi-bot health indicator (already done)
  ];

  for (const id of completedTaskIds) {
    await supabase.from('tasks').update({ status: 'completed' }).eq('id', id);
  }

  console.log('Updated tasks to completed.');
}

updateTasks();
