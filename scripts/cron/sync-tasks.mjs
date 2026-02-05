import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncTasks() {
  // LEGACY: This script used to enforce hardcoded tasks.
  // We now use Supabase as the source of truth.
  // This script is kept for reference or future "seeding" needs but is currently disabled.
  console.log(`[${new Date().toLocaleTimeString()}] Task sync check (DISABLED).`);
}

// Run every hour
setInterval(syncTasks, 3600000);
syncTasks();
