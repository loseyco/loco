import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  // Keep these titles, delete everything else that overlaps or is redundant
  const targetTasks = [
    "Stabilize OpenClaw Gateway & Pi Engine",
    "Local Status GUI (MainRig)",
    "Werk Shop Demo - Live Data",
    "Hourly Status Update System",
    "Mobile UI Fix"
  ];

  const { data: allTasks } = await supabase.from('tasks').select('*');
  
  for (const task of allTasks) {
    if (!targetTasks.includes(task.title)) {
        // Check if it's a legacy or redundant task
        const isLegacy = [
            "Stabilize OpenClaw Gateway",
            "The Werk Shop: Restoration Timeline Demo",
            "Live Dashboard Status Sync"
        ].includes(task.title);

        if (isLegacy || !task.project_id) {
            console.log(`Deleting redundant task: ${task.title}`);
            await supabase.from('tasks').delete().eq('id', task.id);
        }
    }
  }
  console.log('Cleanup complete.');
}

cleanup();
