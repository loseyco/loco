import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncTasks() {
  // 1. Mark 'Update Task Page...' as completed (since it was just finished by subagent)
  await supabase.from('tasks').update({ status: 'completed' }).eq('id', 'ad364fd1-2ad6-4f6d-a72a-ebc29ebbc00c');

  // 2. Mark 'Local Status GUI (MainRig)' as completed (since it was also finished)
  await supabase.from('tasks').update({ status: 'completed' }).eq('id', '5843c28e-7559-4cb5-bee2-f64bd9a483b7');

  console.log('Tasks synchronized with current state.');
}

syncTasks();
