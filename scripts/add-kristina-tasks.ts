import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addTasks() {
  const { data, error } = await supabase.from('tasks').insert([
    {
      title: "Draft Kristina's Invitation Message",
      description: "Draft a clear, professional invitation message for Kristina explaining how to join the dashboard. Show this draft to PJ for approval before sending.",
      status: "pending",
      priority: 2,
      is_special: true
    },
    {
      title: "Mockup Kristina's Dashboard Access",
      description: "Define and document the scope of access for Kristina (e.g., specific projects only). Design the registration flow and project-level permissions.",
      status: "pending",
      priority: 2,
      is_special: true
    }
  ]).select();

  if (error) console.error('Error adding tasks:', error);
  else console.log('Tasks added.');
}

addTasks();
