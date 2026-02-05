import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUniqueAgents() {
  const { data, error } = await supabase
    .from('api_usage')
    .select('agent_id, model');
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  const agents = {};
  data.forEach(row => {
    if (!agents[row.agent_id]) agents[row.agent_id] = new Set();
    agents[row.agent_id].add(row.model);
  });

  const result = {};
  Object.keys(agents).forEach(k => result[k] = Array.from(agents[k]));

  console.log('Unique Agents and their models:', result);
}

getUniqueAgents();
