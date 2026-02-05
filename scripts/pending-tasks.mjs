
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://jxnqsbkvckvfwgmvuajb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bnFzYmt2Y2t2ZndnbXZ1YWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE5ODkzNiwiZXhwIjoyMDg1Nzc0OTM2fQ._IAuu-bsZgyB7hPTnR9H6--K1przqEr7q_-nOKbt9DM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getPendingTasks() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .neq('status', 'completed')
    .order('priority', { ascending: false });

  console.log(JSON.stringify(tasks || [], null, 2));
}

getPendingTasks();
