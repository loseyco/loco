import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function logUsage() {
  try {
    // 1. Get status from OpenClaw
    const statusRaw = execSync('openclaw status --json', { encoding: 'utf8' });
    const status = JSON.parse(statusRaw);

    // 2. Extract session stats
    const recentSessions = status.sessions?.recent || [];
    
    for (const session of recentSessions) {
      if (session.totalTokens > 0) {
        await supabase.from('api_usage').insert({
          agent_id: session.agentId,
          model: session.model,
          input_tokens: session.inputTokens,
          output_tokens: session.outputTokens,
          total_tokens: session.totalTokens,
          status: session.abortedLastRun ? 'error' : 'ok'
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
