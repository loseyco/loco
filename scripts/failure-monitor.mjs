import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFailures() {
  try {
    const logPath = `C:\\Users\\pjlos\\.pm2\\logs\\openclaw-engine-error.log`;
    const tail = execSync(`powershell -Command "Get-Content -Path ${logPath} -Tail 20"`, { encoding: 'utf8' });
    
    if (tail.includes('FailoverError') || tail.includes('rate limit')) {
        console.log('Detected rate limit hit in logs.');
        
        // Log to API usage table
        await supabase.from('api_usage').insert({
            agent_id: 'ops',
            model: 'google-antigravity/gemini-3-flash',
            status: 'rate_limit',
            total_tokens: 0
        });

        // The agent will naturally hit this when it tries to run its next turn
        // but this script ensures it's logged to the dashboard.
    }
  } catch (err) {
    // Log file might not exist or be empty
  }
}

setInterval(checkFailures, 60000); // Check every minute
checkFailures();
