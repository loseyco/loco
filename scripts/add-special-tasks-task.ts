import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addTask() {
  const { data, error } = await supabase.from('tasks').insert([
    {
      title: "Implement 'Special Tasks' View",
      description: "Add a 'Special' filter/tab to the tasks page and a 'is_special' column to the tasks table to track tasks requiring PJ's direct action.",
      status: "pending",
      priority: 2
    }
  ]).select();

  if (error) console.error('Error adding task:', error);
  else console.log('Task added:', data[0].id);
}

addTask();
