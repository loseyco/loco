import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTaskLogs() {
  const taskId = 'c459cb5c-b253-48fa-9315-e3eb80228d75';
  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching logs:', error);
  } else {
    console.log(`Logs for task ${taskId}:`, JSON.stringify(logs, null, 2));
  }
}

checkTaskLogs();
