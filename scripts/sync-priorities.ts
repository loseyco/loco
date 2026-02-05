import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncTasks() {
  // 1. Mark 'Local Status GUI' as pending (stop it)
  await supabase.from('tasks').update({ status: 'pending' }).eq('id', '5843c28e-7559-4cb5-bee2-f64bd9a483b7');

  // 2. Mark 'lets find some quick sale cheap work' as in_progress (it's the top priority)
  await supabase.from('tasks').update({ status: 'in_progress' }).eq('id', 'c459cb5c-b253-48fa-9315-e3eb80228d75');

  // 3. Re-open 'Draft Kristina's Invitation Message' and update description for sam.gov
  await supabase.from('tasks').update({ 
    status: 'in_progress', 
    description: "Draft a clear, professional invitation message for Kristina explaining how to join the dashboard for the sam.gov project. Show this draft to PJ for approval before sending." 
  }).eq('id', '122cd7f2-7384-4e69-aeac-14036471ba6d');

  console.log('Tasks synchronized with current priorities.');
}

syncTasks();
