import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTaskNotes() {
  const { data: cols, error: colError } = await supabase.from('task_notes').select('*').limit(1);
  if (colError) {
    console.log('task_notes table does not exist or error:', colError.message);
  } else {
    console.log('task_notes table exists. Columns:', Object.keys(cols[0] || {}));
  }
}

checkTaskNotes();
