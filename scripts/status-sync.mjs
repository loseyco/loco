import { createClient } from '@supabase/supabase-js';
import si from 'systeminformation';
import fs from 'fs';
import { execSync } from 'child_process';
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

    // 2. Get PM2 status for all apps
    let pm2Stats = [];
    try {
        const pm2List = JSON.parse(execSync('pm2 jlist', { encoding: 'utf8' }));
        pm2Stats = pm2List.map(app => ({
            name: app.name,
            status: app.pm2_env.status,
            cpu: app.monit.cpu,
            memory: app.monit.memory,
            uptime: app.pm2_env.pm_uptime,
            restarts: app.pm2_env.restart_time
        }));
    } catch (e) {
        console.error('PM2 fetch error:', e);
    }

    const { error: sError } = await supabase.from('systems').upsert({
      id: 'main-pc',
      hostname: load.hostname,
      cpu_usage: Math.round(cpu.currentLoad),
      memory_usage: Math.round((mem.active / mem.total) * 100),
      uptime_seconds: Math.round(si.time().uptime),
      last_seen: new Date().toISOString(),
      metadata: { pm2: pm2Stats } // Storing PM2 list in JSONB column
    });
    if (sError) console.error('Systems sync error:', sError);

    // 3. Get Agent Status (from HEARTBEAT.md)
    let currentGoal = "Stabilizing Gateway & Workspace";
    try {
        const heartbeat = fs.readFileSync('HEARTBEAT.md', 'utf8');
        const match = heartbeat.match(/## Currently In Progress\n- (.*)/);
        if (match) currentGoal = match[1].replace(/^[🔄✅] /, '');
    } catch (e) {}

    // Check if any PM2 app is NOT online
    const allOnline = pm2Stats.length > 0 && pm2Stats.every(app => app.status === 'online');
    const status = allOnline ? 'idle' : 'error';

    const { error: cError } = await supabase.from('chase_status').upsert({
      id: 'cc7493e5-2b6a-4ece-a148-e0d1a8f12c5b',
      current_task: currentGoal,
      status: status,
      last_action: allOnline ? 'Telemetry sync active.' : 'Detected process failures in PM2.',
      updated_at: new Date().toISOString()
    });
    if (cError) console.error('Chase Status sync error:', cError);

    if (!sError && !cError) {
        console.log(`[${new Date().toLocaleTimeString()}] Stats synced (Apps: ${pm2Stats.length}).`);
    }
  } catch (err) {
    console.error('Sync error:', err);
  }
}

// Run every 30 seconds
setInterval(sync, 30000);
sync();
