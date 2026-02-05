import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function stopTasks() {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'pending' })
    .eq('status', 'in_progress');

  if (error) console.error('Error stopping tasks:', error);
  else console.log('All in-progress tasks have been set to pending.');
}

stopTasks();
