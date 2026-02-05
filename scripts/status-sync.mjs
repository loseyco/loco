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
        // Use pm2.cmd on Windows and ensure it doesn't hang
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
        // Silent error for PM2
    }

    const { error: sError } = await supabase.from('systems').upsert({
      id: 'main-pc',
      hostname: load.hostname,
      cpu_usage: Math.round(cpu.currentLoad),
      memory_usage: Math.round((mem.active / mem.total) * 100),
      uptime_seconds: Math.round(si.time().uptime),
      last_seen: new Date().toISOString()
      // Removed metadata column as it's missing from schema
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
    // Filter to only core apps if needed, but for now check all
    const allOnline = pm2Stats.length > 0 && pm2Stats.every(app => app.status === 'online');
    
    // Chase Status table uses 'working' | 'idle' | 'error' | 'offline'
    let status = allOnline ? 'idle' : 'error';
    let lastAction = allOnline ? 'Telemetry sync active.' : 'Detected process failures in PM2.';

    // 4. Check for Rate Limits/Failures in OpenClaw logs
    try {
        const logPath = `\\tmp\\openclaw\\openclaw-${new Date().toISOString().split('T')[0]}.log`;
        if (fs.existsSync(logPath)) {
            // Read last 1000 chars to save memory/speed
            const stats = fs.statSync(logPath);
            const start = Math.max(0, stats.size - 5000);
            const buffer = Buffer.alloc(stats.size - start);
            const fd = fs.openSync(logPath, 'r');
            fs.readSync(fd, buffer, 0, buffer.length, start);
            fs.closeSync(fd);
            const logs = buffer.toString();
            
            if (logs.includes('FailoverError') || logs.includes('rate limit')) {
                lastAction = '⚠️ BRAIN COOLDOWN: Hitting Google Rate Limits';
                // status = 'error'; // Optional: show red on dashboard
            }
        }
    } catch (e) {}

    const { error: cError } = await supabase.from('chase_status').upsert({
      id: 'cc7493e5-2b6a-4ece-a148-e0d1a8f12c5b',
      current_task: currentGoal,
      status: status,
      last_action: lastAction,
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
