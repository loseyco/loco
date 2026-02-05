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

  // Mark "Werk Shop Demo" tasks as completed
  const { error: err2 } = await supabase
    .from('tasks')
    .update({ status: 'completed' })
    .ilike('title', '%werk%');
  
  if (err1 || err2) console.error('Error updating tasks:', err1 || err2);
  else console.log('Task status synced with current activity.');
}

syncTaskStatus();
