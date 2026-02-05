import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/LoCoOS/.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updateTask() {
  const taskId = 'c459cb5c-b253-48fa-9315-e3eb80228d75';
  const progress = "Research completed for 5 local auto restoration shops (Ironhorse Classics, Mercury Charlie, Robinson Restoration, Riggs Fabrication, Jeff's Resurrections). Final outreach package prepared in memory/outreach-ready.md. Confirmed emails for Ironhorse and Jeff's. Flagged others for manual outreach via social/phone.";

  const { data, error } = await supabase
    .from('tasks')
    .update({ 
      status: 'in-progress',
      description: progress 
    })
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task:', error);
  } else {
    console.log('Successfully updated task c459cb5c-b253-48fa-9315-e3eb80228d75');
  }
}

updateTask();
