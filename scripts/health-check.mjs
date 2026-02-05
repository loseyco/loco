import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function logToSupabase(action, details) {
  try {
    await supabase.from('activity_logs').insert({
      agent: 'ops',
      action,
      details
    });
  } catch (err) {
    console.error('Failed to log to Supabase:', err);
  }
}

async function runHealthCheck() {
  const logFile = "memory/2026-02-05.md";
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  let report = `\n## [${timestamp}] Gateway Watchdog Check\n`;
  let allHealthy = true;

  try {
    // 1. Check openclaw-engine (Port 18790)
    try {
      execSync('netstat -ano | findstr :18790');
      report += "- **openclaw-engine (18790):** ONLINE & LISTENING\n";
    } catch (e) {
      report += "- **openclaw-engine (18790):** OFFLINE or NOT LISTENING. Attempting restart...\n";
      execSync('pm2 restart openclaw-engine');
      await logToSupabase("RESTART", "Restarted openclaw-engine due to port 18790 timeout");
      allHealthy = false;
    }

    // 2. Check openclaw-voice (Port 18789)
    try {
      execSync('netstat -ano | findstr :18789');
      report += "- **openclaw-voice (18789):** ONLINE & LISTENING\n";
    } catch (e) {
      report += "- **openclaw-voice (18789):** OFFLINE or NOT LISTENING. Attempting restart...\n";
      execSync('pm2 restart openclaw-voice');
      await logToSupabase("RESTART", "Restarted openclaw-voice due to port 18789 timeout");
      allHealthy = false;
    }

    // 3. Check PM2 status for other services
    const pm2ListRaw = execSync('pm2 jlist', { encoding: 'utf8' });
    const pm2List = JSON.parse(pm2ListRaw);

    for (const app of pm2List) {
      if (app.name !== "openclaw-engine" && app.name !== "openclaw-voice") {
        const status = app.pm2_env.status;
        report += `- **${app.name}:** ${status}\n`;
        if (status !== "online") {
          execSync(`pm2 restart ${app.name}`);
          await logToSupabase("RESTART", `Restarted ${app.name} (status: ${status})`);
          allHealthy = false;
        }
      }
    }

    if (allHealthy) {
      await logToSupabase("HEALTH_CHECK", "All services verified online and listening.");
    }

    fs.appendFileSync(logFile, report);
    console.log("Health check completed.");
  } catch (err) {
    console.error("Health check error:", err);
  }
}

runHealthCheck();
