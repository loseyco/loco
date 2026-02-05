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
    let tail = '';

    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      const fileSize = stats.size;
      const bufferSize = Math.min(10240, fileSize); // Read last 10KB
      const buffer = Buffer.alloc(bufferSize);
      const fd = fs.openSync(logPath, 'r');
      fs.readSync(fd, buffer, 0, bufferSize, fileSize - bufferSize);
      fs.closeSync(fd);
      tail = buffer.toString('utf8');
    }

    if (tail.includes('FailoverError') || tail.includes('rate limit')) {
      console.log('Detected rate limit hit in logs.');

      // Log to activity_logs table for dashboard visibility
      await supabase.from('activity_logs').insert({
        agent: 'ops',
        action: 'BRAIN_COOLDOWN',
        details: 'System hitting Google AI rate limits, cooling down.'
      });
    }
  } catch (err) {
    // Silent fail
  }
}

setInterval(checkFailures, 60000); // Check every minute
checkFailures();
