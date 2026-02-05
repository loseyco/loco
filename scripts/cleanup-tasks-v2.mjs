import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  const targetTasks = [
    { title: "Staff PM2 Dashboard", status: "pending", priority: 2, description: "Show real-time PM2 process list and statuses in the dashboard header." },
    { title: "Multi-Bot Health Indicator", status: "pending", priority: 2, description: "Header status for all running bots (Yellow/Red if down)." },
    { title: "Remote Reboot Capability", status: "pending", priority: 1, description: "Way to remotely reboot the PC via command." },
    { title: "Lead Gen & Outreach", status: "in_progress", priority: 3, description: "Reviewing shop leads and AI job matches in memory/leads-research.md." },
    { title: "Discord Channel Organization", status: "pending", priority: 2, description: "Organize Discord into Bot Comms, Logs, and Announcements sections." },
    { title: "Hourly Site/Dashboard Audit", status: "in_progress", priority: 2, description: "Once-an-hour audio/status report on losey.co and dashboard health." }
  ];

  // 1. Fetch current tasks
  const { data: allTasks } = await supabase.from('tasks').select('*');
  
  // 2. Identify completed tasks to keep for history
  const completedToKeep = allTasks.filter(t => t.status === 'completed');

  // 3. Delete all non-completed tasks
  for (const t of allTasks.filter(t => t.status !== 'completed')) {
      await supabase.from('tasks').delete().eq('id', t.id);
  }

  // 4. Insert new unified pending/in_progress tasks
  for (const task of targetTasks) {
      await supabase.from('tasks').insert(task);
  }
  
  console.log('Task list unified and cleaned.');
}

cleanup();
