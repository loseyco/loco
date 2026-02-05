import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from site/.env.local
dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTasks() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'todo')
    .order('priority', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return;
  }

  console.log('--- TODO TASKS ---');
  tasks?.forEach(task => {
    console.log(`[${task.priority}] ${task.title} (${task.id})`);
  });
}

checkTasks();
