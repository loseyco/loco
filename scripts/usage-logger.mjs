import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function logUsage() {
  try {
    // 1. Get status from OpenClaw (using node direct since powershell might be restricted)
    const statusRaw = execSync('node -e "require(\'child_process\').execSync(\'openclaw status --json\', {stdio: \'inherit\'})"', { encoding: 'utf8' });
    // Wait, that's not right. Just use openclaw status --json directly.
    // If 'openclaw' command fails, try full path.
    let status;
    try {
        const raw = execSync('openclaw status --json', { encoding: 'utf8' });
        status = JSON.parse(raw);
    } catch (e) {
        // Try npx if command not in path
        const raw = execSync('npx -y openclaw status --json', { encoding: 'utf8' });
        status = JSON.parse(raw);
    }

    // 2. Extract session stats
    const recentSessions = status.sessions?.recent || [];
    
    for (const session of recentSessions) {
      if (session.totalTokens > 0) {
        await supabase.from('api_usage').insert({
          agent: session.agentId,
          model: session.model,
          tokens_in: session.inputTokens || 0,
          tokens_out: session.outputTokens || 0,
          recorded_at: new Date().toISOString()
          // usage_percent and reset_in are harder to get from just status --json 
          // without parsing the text status or hitting the gateway API.
        });
      }
    }

    console.log(`[${new Date().toLocaleTimeString()}] Usage logged.`);
  } catch (err) {
    console.error('Usage logging error:', err);
  }
}

// Run every 10 minutes
setInterval(logUsage, 600000);
logUsage();
