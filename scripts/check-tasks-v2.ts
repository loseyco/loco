import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTasks() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('priority', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return;
  }

  console.log('--- TODO TASKS ---');
  if (!tasks || tasks.length === 0) {
    console.log('No tasks found.');
  } else {
    tasks.forEach(task => {
        if (task.status !== 'completed') {
            console.log(`[Priority: ${task.priority}] [Status: ${task.status}] ${task.title} (${task.id})`);
        }
    });
  }
}

checkTasks();
