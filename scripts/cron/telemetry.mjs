import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import os from 'os';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendTelemetry() {
  const hostname = os.hostname();
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  
  // Calculate basic load
  const load = os.loadavg()[0]; // 1 min load
  const cpuUsage = Math.min(100, Math.round((load / cpus.length) * 100));
  const memUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);
  
  const stats = {
    id: 'main-pc',
    hostname,
    cpu_usage: cpuUsage,
    memory_usage: memUsage,
    uptime_seconds: Math.round(os.uptime()),
    last_seen: new Date().toISOString()
  };

  const { error } = await supabase
    .from('systems')
    .upsert(stats);

  if (error) {
    console.error('❌ Telemetry Error:', error.message);
  } else {
    console.log(`📡 Telemetry Sent: CPU ${cpuUsage}% | MEM ${memUsage}%`);
  }
}

// Send every 30 seconds
setInterval(sendTelemetry, 30000);
sendTelemetry();
