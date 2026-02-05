import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncTasks() {
  try {
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
        await supabase.from('tasks').update(task).eq('id', existing.id);
      } else {
        await supabase.from('tasks').insert(task);
      }
    }
    console.log(`[${new Date().toLocaleTimeString()}] Tasks synced.`);
  } catch (err) {
    console.error('Task sync error:', err);
  }
}

// Run every hour
setInterval(syncTasks, 3600000);
syncTasks();
