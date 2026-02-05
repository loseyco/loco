import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function startTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'in_progress' })
    .eq('id', taskId);

  if (error) console.error('Error starting task:', error);
  else console.log(`Task ${taskId} is now in_progress.`);
}

// Starting "Update Task Page to have more information and control" (ad364fd1-2ad6-4f6d-a72a-ebc29ebbc00c)
startTask('ad364fd1-2ad6-4f6d-a72a-ebc29ebbc00c');
