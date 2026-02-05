import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateTask() {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'completed' })
    .eq('id', '1e5277da-35ee-4738-8edc-17cc3d01a136');

  if (error) console.error('Error updating task:', error);
  else console.log('Successfully marked task as completed.');
}

updateTask();
