import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Memory of last seen tasks to detect changes
let lastTasksHash = '';

function getTasksHash(tasks) {
  return JSON.stringify(tasks.map(t => ({ id: t.id, status: t.status, priority: t.priority, title: t.title })));
}

async function syncAndCheck() {
  try {
    // 1. Fetch current tasks from DB
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('priority', { ascending: false });

    if (error) throw error;

    const currentHash = getTasksHash(tasks);

    // 2. If tasks changed, update HEARTBEAT.md
    if (currentHash !== lastTasksHash) {
      console.log(`[${new Date().toLocaleTimeString()}] Task changes detected. Updating HEARTBEAT.md...`);

      const path = 'HEARTBEAT.md';
      let content = fs.readFileSync(path, 'utf8');

      // Update the "Last Updated" line
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', { timeZone: 'America/Chicago', hour12: true, month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      content = content.replace(/\*\*Last Updated:\*\* .*/, `**Last Updated:** ${timestamp} CST`);

      // Update Task Summary section
      const activeTasks = tasks.filter(t => t.status === 'in_progress').map(t => `\`${t.title}\``).join(', ') || 'None';
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;

      const taskSection = `
### 🛠️ Task Summary
* **Active:** ${activeTasks}
* **Pending:** ${pendingTasks} total pending tasks.
* **Latest Change:** Detected at ${timestamp}
`;

      const regex = /### 🛠️ Task Summary[\s\S]*?(?=\n##|$)/;
      if (regex.test(content)) {
        content = content.replace(regex, taskSection.trim() + '\n');
      } else {
        // Insert after Currently In Progress
        content = content.replace(/## Currently In Progress/, `## Currently In Progress\n${taskSection}`);
      }

      fs.writeFileSync(path, content);
      lastTasksHash = currentHash;
    }

    console.log(`[${new Date().toLocaleTimeString()}] Task sync check complete.`);
  } catch (err) {
    console.error('Task sync error:', err);
  }
}

// Run every 2 minutes
setInterval(syncAndCheck, 120000);
syncAndCheck();
