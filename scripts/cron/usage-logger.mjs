import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LIMITS = {
  TPM: 1000000,
  RPM: 15,
  RPD: 1500
};

// Track already logged session IDs to avoid double counting
const loggedSessionIds = new Set();

async function getStats() {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000).toISOString();
  const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();

  // Get minute stats
  const { data: minData, error: minError } = await supabase
    .from('api_usage')
    .select('total_tokens')
    .gte('created_at', oneMinuteAgo);

  // Get day stats
  const { data: dayData, error: dayError } = await supabase
    .from('api_usage')
    .select('id')
    .gte('created_at', todayStart);

  if (minError || dayError) throw minError || dayError;

  const usedTPM = minData.reduce((sum, row) => sum + (row.total_tokens || 0), 0);
  const usedRPM = minData.length;
  const usedRPD = dayData.length;

  return {
    tpmPercent: (usedTPM / LIMITS.TPM) * 100,
    rpmPercent: (usedRPM / LIMITS.RPM) * 100,
    rpdPercent: (usedRPD / LIMITS.RPD) * 100,
    usedTPM,
    usedRPM,
    usedRPD
  };
}

async function updateHeartbeat(stats) {
  const path = 'HEARTBEAT.md';
  let content = fs.readFileSync(path, 'utf8');

  const now = new Date();
  const timestamp = now.toLocaleString('en-US', { timeZone: 'America/Chicago', hour12: true, month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Update the "Last Updated" line
  content = content.replace(/\*\*Last Updated:\*\* .*/, `**Last Updated:** ${timestamp} CST`);

  const fuelGauge = `
## ⛽ Fuel Gauge (Token Usage)
- **TPM (Tokens/Min):** ${stats.usedTPM.toLocaleString()} / ${LIMITS.TPM.toLocaleString()} (${stats.tpmPercent.toFixed(1)}%)
- **RPM (Req/Min):** ${stats.usedRPM} / ${LIMITS.RPM} (${stats.rpmPercent.toFixed(1)}%)
- **RPD (Req/Day):** ${stats.usedRPD.toLocaleString()} / ${LIMITS.RPD.toLocaleString()} (${stats.rpdPercent.toFixed(1)}%)
- **Status:** ${stats.tpmPercent > 80 || stats.rpmPercent > 80 ? '⚠️ LOW FUEL' : '✅ TANK FULL'}
`;

  const regex = /## ⛽ Fuel Gauge[\s\S]*?(?=\n##|$)/;
  if (regex.test(content)) {
    content = content.replace(regex, fuelGauge.trim());
  } else {
    content += '\n' + fuelGauge;
  }

  fs.writeFileSync(path, content);
}

async function logUsage() {
  try {
    let status;
    const openclawPath = 'C:\\Users\\pjlos\\AppData\\Roaming\\npm\\node_modules\\openclaw\\dist\\index.js';
    const raw = execSync(`node "${openclawPath}" status --json`, { encoding: 'utf8', windowsHide: true });
    status = JSON.parse(raw);

    const recentSessions = status.sessions?.recent || [];

    for (const session of recentSessions) {
      if (session.totalTokens > 0 && !loggedSessionIds.has(session.sessionId)) {
        const { error } = await supabase.from('api_usage').insert({
          id: session.sessionId,
          agent_id: session.agentId,
          model: session.model,
          input_tokens: session.inputTokens || 0,
          output_tokens: session.outputTokens || 0,
          total_tokens: session.totalTokens || 0,
          status: 'success'
        });

        if (!error) {
          loggedSessionIds.add(session.sessionId);
        }
      }
    }

    const stats = await getStats();
    await updateHeartbeat(stats);

    console.log(`[${new Date().toLocaleTimeString()}] Usage logged & Heartbeat updated.`);
  } catch (err) {
    console.error('Usage logging error:', err);
  }
}

// Run every 1 minute
setInterval(logUsage, 60000);
logUsage();
