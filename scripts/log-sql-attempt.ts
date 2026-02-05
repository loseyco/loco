import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addNote(taskId: string, content: string) {
  const { error } = await supabase
    .from('task_notes')
    .insert([{ task_id: taskId, author: 'chase', content }]);

  if (error) console.error('Error adding note:', error);
  else console.log('Note added to task.');
}

addNote('cdb88033-27ac-472f-904d-6b2489176d51', 'Attempting to find the DATABASE_URL or direct connection string to execute SQL migrations without requiring manual intervention in the Supabase UI.');
