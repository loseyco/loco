import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  const targetTasks = [
    { title: "Stabilize OpenClaw Gateway & Pi Engine", status: "completed", priority: 3, description: "Auto-recovery via PM2 and Watchdog." },
    { title: "Mobile UI Polish", status: "completed", priority: 3, description: "Responsive dashboard and status bar for phone usage." },
    { title: "Hourly Status Update System", status: "completed", priority: 2, description: "Automated Discord pings every 15m." },
    { title: "Failsafe Bot Recovery", status: "completed", priority: 3, description: "Auto-recover and notify Discord on system down." },
    { title: "Headless Boot Setup", status: "completed", priority: 3, description: "Bots now launch at system power-on without Windows login." },
    { title: "Disable UAC", status: "completed", priority: 3, description: "User Account Control disabled for seamless background management." },
    { title: "Boot Notification System", status: "completed", priority: 2, description: "First thing on boot: PM Discord and refresh tasks." },
    { title: "Remote Reboot Capability", status: "pending", priority: 1, description: "Way to remotely reboot the PC via command." },
    { title: "Staff PM2 Dashboard", status: "pending", priority: 2, description: "Show real-time PM2 process list and statuses in the dashboard header." },
    { title: "Multi-Bot Health Indicator", status: "pending", priority: 2, description: "Header status for all running bots (Yellow/Red if down)." },
    { title: "API Limit Notification", status: "completed", priority: 3, description: "Dashboard now alerts when Google Rate Limits are hit." },
    { title: "Werk Shop Demo - Live Data", status: "in_progress", priority: 3, description: "Wire restoration timeline to real Supabase tables." }
  ];

  const { data: allTasks } = await supabase.from('tasks').select('*');
  for (const t of allTasks) { await supabase.from('tasks').delete().eq('id', t.id); }
  for (const task of targetTasks) { await supabase.from('tasks').insert(task); }
  
  console.log('Task list unified and cleaned.');
}
cleanup();
