import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncTaskStatus() {
  // Update "lets find some quick sale cheap work" to in_progress
  const { error: err1 } = await supabase
    .from('tasks')
    .update({ status: 'in_progress', priority: 2 })
    .eq('id', 'c459cb5c-b253-48fa-9315-e3eb80228d75');

  // Ensure other tasks are not "in_progress" unless meant to be
  // We'll leave the others as they are for now.
  
  if (err1) console.error('Error updating task:', err1);
  else console.log('Task status synced with current activity.');
}

syncTaskStatus();
