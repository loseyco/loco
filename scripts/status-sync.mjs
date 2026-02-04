import { createClient } from '@supabase/supabase-js';
import si from 'systeminformation';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sync() {
  try {
    // 1. Get System Stats
    const [cpu, mem, load] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.osInfo()
    ]);

    await supabase.from('system_stats').upsert({
      hostname: load.hostname,
      cpu_usage: cpu.currentLoad,
      memory_usage: (mem.active / mem.total) * 100,
      uptime_seconds: si.time().uptime,
      last_seen: new Date().toISOString()
    });

    // 2. Get Agent Status
    let currentGoal = "Stabilizing Gateway & Workspace";
    try {
        const heartbeat = fs.readFileSync('HEARTBEAT.md', 'utf8');
        const match = heartbeat.match(/## Currently In Progress\n- (.*)/);
        if (match) currentGoal = match[1].replace(/^[🔄✅] /, '');
    } catch (e) {}

    // 3. Check Staff (Engine 18790)
    let staffOnline = false;
    try {
        const engineRes = await si.inetChecksite('http://127.0.0.1:18790');
        staffOnline = engineRes.status === 200;
    } catch (e) {}

    await supabase.from('agent_status').upsert({
      agent_id: 'ops',
      current_goal: currentGoal,
      status_text: 'Active - Monitoring System',
      active_subagents: 0,
      staff_online: staffOnline,
      updated_at: new Date().toISOString()
    });

    console.log(`[${new Date().toLocaleTimeString()}] Stats synced.`);
  } catch (err) {
    console.error('Sync error:', err);
  }
}

// Run every 30 seconds
setInterval(sync, 30000);
sync();
