import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function finishTasks() {
  const taskIds = [
    'cdb88033-27ac-472f-904d-6b2489176d51', // Fix sql imports
    '122cd7f2-7384-4e69-aeac-14036471ba6d', // Draft Kristina's Invitation Message
    'dcc52052-de90-439b-9179-ec793b35d94a'  // Mockup Kristina's Dashboard Access
  ];

  for (const id of taskIds) {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', id);
    if (error) console.error(`Error completing task ${id}:`, error);
  }

  console.log('Tasks completed.');
}

finishTasks();
