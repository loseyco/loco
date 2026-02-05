import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncTasks() {
  // 1. Move 'Werk Shop Demo - Live Data' to pending and low priority
  await supabase.from('tasks').update({ status: 'pending', priority: 0 }).eq('id', '1221d6c4-1380-4aab-9334-0f6b7d2a3b16');

  // 2. Move 'Local Status GUI (MainRig)' to pending
  await supabase.from('tasks').update({ status: 'pending' }).eq('id', '5843c28e-7559-4cb5-bee2-f64bd9a483b7');

  // 3. Ensure 'lets find some quick sale cheap work' is in_progress and high priority
  await supabase.from('tasks').update({ status: 'in_progress', priority: 2 }).eq('id', 'c459cb5c-b253-48fa-9315-e3eb80228d75');

  // 4. Move 'Update Task Page...' to pending
  await supabase.from('tasks').update({ status: 'pending' }).eq('id', 'ad364fd1-2ad6-4f6d-a72a-ebc29ebbc00c');

  console.log('Tasks synchronized with current priorities.');
}

syncTasks();
