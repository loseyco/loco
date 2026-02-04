import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncTasks() {
  const currentTasks = [
    {
      title: "Stabilize OpenClaw Gateway & Pi Engine",
      description: "Ensure both 18789 and 18790 gateways are running. Auto-recovery via PM2 and Watchdog.",
      status: "completed",
      priority: 2
    },
    {
      title: "Local Status GUI (MainRig)",
      description: "Maintain local dashboard access for PJ on the SimRig PC.",
      status: "in_progress",
      priority: 2
    },
    {
      title: "Werk Shop Demo - Live Data",
      description: "Wire the restoration timeline to real Supabase tables for dynamic updates.",
      status: "in_progress",
      priority: 2
    },
    {
      title: "Hourly Status Update System",
      description: "Automated Discord pings with concise status and blocked items.",
      status: "completed",
      priority: 1
    },
    {
      title: "Mobile UI Fix",
      description: "Update dashboard layout for usable mobile experience and responsive status bar.",
      status: "completed",
      priority: 2
    }
  ];

  for (const task of currentTasks) {
    const { data: existing } = await supabase
      .from('tasks')
      .select('id')
      .eq('title', task.title)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('tasks')
        .update(task)
        .eq('id', existing.id);
      if (error) console.error(`Error updating task ${task.title}:`, error);
      else console.log(`Updated: ${task.title}`);
    } else {
      const { error } = await supabase
        .from('tasks')
        .insert(task);
      if (error) console.error(`Error inserting task ${task.title}:`, error);
      else console.log(`Inserted: ${task.title}`);
    }
  }
}

syncTasks();
