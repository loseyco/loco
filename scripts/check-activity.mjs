import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'site/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSubAgents() {
  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('--- RECENT ACTIVITY ---');
  logs.forEach(l => console.log(`- [${new Date(l.created_at).toLocaleTimeString()}] ${l.action}: ${l.details}`));
}

checkSubAgents();