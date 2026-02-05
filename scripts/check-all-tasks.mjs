import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'site/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTasks() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('--- ALL TASKS ---');
  tasks.forEach(t => {
    console.log(`- [${t.status}] ${t.title} (ID: ${t.id}, Priority: ${t.priority})`);
  });
}

checkTasks();
