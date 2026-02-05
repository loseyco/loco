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
    let engineOnline = false;
    try {
      const pm2ListRaw = execSync('pm2 jlist', {
        encoding: 'utf8',
        timeout: 10000,
        windowsHide: true,
        env: { ...process.env, PM2_HOME: 'C:\\Users\\pjlos\\.pm2' }
      });
      const pm2List = JSON.parse(pm2ListRaw);
      pm2Stats = pm2List.map(app => {
        if (app.name === 'openclaw-engine' && app.pm2_env.status === 'online') {
          engineOnline = true;
        }
        return {
          name: app.name,
          status: app.pm2_env.status,
          cpu: app.monit?.cpu || 0,
          memory: app.monit?.memory || 0,
          uptime: app.pm2_env.pm_uptime,
          restarts: app.pm2_env.restart_time
        };
      });
    } catch (e) {
      console.error('PM2 list error:', e);
    }

    const { error: sError } = await supabase.from('systems').upsert({
      id: 'main-pc',
      hostname: load.hostname,
      cpu_usage: Math.round(cpu.currentLoad),
      memory_usage: Math.round((mem.active / mem.total) * 100),
      uptime_seconds: Math.round(si.time().uptime),
      last_seen: new Date().toISOString(),
      metadata: { pm2: pm2Stats }
    });
    if (sError) console.error('Systems sync error:', sError);

    // 3. Get Active Task from DB
    let currentGoal = "Idle";
    try {
      const { data: activeTask } = await supabase
        .from('tasks')
        .select('title')
        .eq('status', 'in_progress')
        .order('priority', { ascending: false })
        .limit(1)
        .single();

      if (activeTask) {
        currentGoal = activeTask.title;
      }
    } catch (e) { }

    // 4. Get active sessions count (sub-agents)
    let activeSubagentsCount = 0;
    let subagentsList = [];
    try {
      const openclawPath = 'C:\\Users\\pjlos\\AppData\\Roaming\\npm\\node_modules\\openclaw\\dist\\index.js';
      const statusRaw = execSync(`node "${openclawPath}" status --json`, { encoding: 'utf8', windowsHide: true });
      const status = JSON.parse(statusRaw);
      const recentSessions = status.sessions?.recent || [];

      const filtered = recentSessions.filter(s => s.agentId !== 'ops' && s.age < 600000);
      activeSubagentsCount = filtered.length;
      subagentsList = filtered.map(s => ({
        label: s.label || s.agentId,
        status: 'active',
        model: s.model,
        last_updated: new Date(s.updatedAt).toISOString()
      }));
    } catch (e) { }

    const allOnline = pm2Stats.length > 0 && pm2Stats.every(app => app.status === 'online');
    let status = (activeSubagentsCount > 0 || currentGoal !== "Idle") ? 'working' : 'idle';
    let lastAction = `System monitoring active. ${activeSubagentsCount} sub-agents running.`;

    // 5. Update chase_status
    // Note: Since we can't add columns easily, we'll store subagents in the metadata if needed, 
    // but the dashboard expects them in certain places.
    // For now, let's just make sure the basic status is correct.
    const statusUpdate = {
      id: 'cc7493e5-2b6a-4ece-a148-e0d1a8f12c5b',
      current_task: currentGoal,
      status: status,
      last_action: lastAction,
      updated_at: new Date().toISOString()
    };

    const { error: cError } = await supabase.from('chase_status').upsert(statusUpdate);
    if (cError) console.error('Chase Status sync error:', cError);

    if (!sError && !cError) {
      console.log(`[${new Date().toLocaleTimeString()}] Stats synced. Goal: ${currentGoal}, Sub-agents: ${activeSubagentsCount}`);
    }
  } catch (err) {
    console.error('Sync error:', err);
  }
}

// Run every 30 seconds
setInterval(sync, 30000);
sync();
