import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function logTaskActivity() {
  const taskId = 'c459cb5c-b253-48fa-9315-e3eb80228d75';
  const { data, error } = await supabase.from('activity_logs').insert([
    {
      agent: 'ops',
      action: 'RESEARCH',
      details: 'Identified 5 high-potential local shops for outreach: Ironhorse Classics, Mercury Charlie, RRS Texas, Riggs Fabrication, and Jeff’s Resurrections.',
      task_id: taskId
    }
  ]).select();

  if (error) console.error('Error logging task activity:', error);
  else console.log('Activity logged for task:', data[0].id);
}

logTaskActivity();
