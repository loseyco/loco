import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTables() {
  const tables = ['tasks', 'agent_status', 'chase_status', 'systems', 'api_usage', 'activity_logs'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table}: Error - ${error.message}`);
    } else {
      const cols = data.length > 0 ? Object.keys(data[0]) : 'no rows to determine columns';
      console.log(`Table ${table}: Exists. Columns:`, cols);
    }
  }
}

checkTables();
