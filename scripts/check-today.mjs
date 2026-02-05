import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'site/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkToday() {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .gte('created_at', '2026-02-05T00:00:00Z')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('--- TODAY\'S ACTIVITY ---');
  data.forEach(l => {
    console.log(`[${l.created_at}] ${l.action}: ${l.details}`);
  });
}

checkToday();
