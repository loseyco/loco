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
    const [cpu, mem, load] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.osInfo()
    ]);

    let pm2Stats = [];
    try {
        const pm2ListRaw = execSync('pm2.cmd jlist', { 
            encoding: 'utf8', 
            timeout: 10000,
            env: { ...process.env, PM2_HOME: 'C:\\Users\\pjlos\\.pm2' }
        });
        const pm2List = JSON.parse(pm2ListRaw);
        pm2Stats = pm2List.map(app => ({
            name: app.name,
            status: app.pm2_env.status,
            cpu: app.monit?.cpu || 0,
            memory: app.monit?.memory || 0,
            uptime: app.pm2_env.pm_uptime,
            restarts: app.pm2_env.restart_time
        }));
    } catch (e) {
        console.error('PM2 fetch error:', e.message);
    }

    const { error: sError } = await supabase.from('systems').upsert({
      id: 'main-pc',
      hostname: load.hostname,
      cpu_usage: Math.round(cpu.currentLoad),
      memory_usage: Math.round((mem.active / mem.total) * 100),
      last_seen: new Date().toISOString()
    });
    // if (sError) console.error('Systems sync error:', sError);

    let currentGoal = "Stabilizing Gateway & Workspace";
    try {
        const heartbeat = fs.readFileSync('HEARTBEAT.md', 'utf8');
        const match = heartbeat.match(/## Currently In Progress\n- (.*)/);
        if (match) currentGoal = match[1].replace(/^[🔄✅] /, '');
    } catch (e) {}

    const allOnline = pm2Stats.length > 0 && pm2Stats.every(app => app.status === 'online');
    let status = allOnline ? 'idle' : 'working';

    const { error: cError } = await supabase.from('chase_status').upsert({
      id: 'cc7493e5-2b6a-4ece-a148-e0d1a8f12c5b',
      current_task: currentGoal,
      status: status,
      last_action: allOnline ? 'Telemetry sync active.' : 'Detected process failures in PM2.',
      updated_at: new Date().toISOString()
    });
    // if (cError) console.error('Chase Status sync error:', cError);

    console.log(`[${new Date().toLocaleTimeString()}] Stats synced (Apps: ${pm2Stats.length}).`);
  } catch (err) {
    console.error('Sync error:', err);
  }
}

setInterval(sync, 30000);
sync();
