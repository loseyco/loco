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
    const tail = execSync(`powershell -Command "if (Test-Path ${logPath}) { Get-Content -Path ${logPath} -Tail 20 } else { '' }"`, { encoding: 'utf8' });
    
    if (tail.includes('FailoverError') || tail.includes('rate limit')) {
        console.log('Detected rate limit hit in logs.');
        
        // Log to API usage table
        await supabase.from('api_usage').insert({
            agent: 'ops',
            model: 'google-antigravity/gemini-3-flash',
            recorded_at: new Date().toISOString()
        });
    }
  } catch (err) {
    // Silent fail
  }
}

setInterval(checkFailures, 60000); // Check every minute
checkFailures();
