import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  // Master list of tasks to keep (unified and prioritized)
  const targetTasks = [
    { title: "Stabilize OpenClaw Gateway & Pi Engine", status: "completed", priority: 3, description: "Auto-recovery via PM2 and Watchdog." },
    { title: "Mobile UI Polish", status: "completed", priority: 3, description: "Responsive dashboard and status bar for phone usage." },
    { title: "Local Status GUI (MainRig)", status: "completed", priority: 2, description: "Auto-login dashboard access on SimRig PC." },
    { title: "Hourly Status Update System", status: "completed", priority: 2, description: "Automated Discord pings every 15m." },
    { title: "Werk Shop Demo - Live Data", status: "in_progress", priority: 3, description: "Wire restoration timeline to real Supabase tables." },
    { title: "Audit GridPass.App", status: "pending", priority: 2, description: "Full site audit and strategy development." },
    { title: "Build Jobs/Income Section", status: "pending", priority: 2, description: "Remote job hunting and service offering plan." },
    { title: "Setup Sales Bot Agent", status: "pending", priority: 2, description: "Automated outreach and lead generation drafting." },
    { title: "Facebook Page Management", status: "pending", priority: 1, description: "Manage and update loseyco social presence." }
  ];

  const { data: allTasks } = await supabase.from('tasks').select('*');
  
  // 1. Delete everything currently in the table to start fresh
  for (const t of allTasks) {
      await supabase.from('tasks').delete().eq('id', t.id);
  }

  // 2. Insert the unified master list
  for (const task of targetTasks) {
      await supabase.from('tasks').insert(task);
  }
  
  console.log('Task list unified and cleaned.');
}

cleanup();
