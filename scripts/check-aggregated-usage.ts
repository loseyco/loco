import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAggregatedUsage() {
  const { data, error } = await supabase
    .from('api_usage')
    .select('agent_id, total_tokens');
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  const totals = data.reduce((acc, curr) => {
    acc[curr.agent_id] = (acc[curr.agent_id] || 0) + curr.total_tokens;
    return acc;
  }, {});

  console.log('Aggregated Usage:', totals);
}

getAggregatedUsage();
