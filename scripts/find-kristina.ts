import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findKristina() {
  // We'll search through messages to see if we can find her name or ID
  const { data: messages, error } = await supabase
    .from('activity_logs')
    .select('details, agent')
    .ilike('details', '%Kristina%');

  if (error) {
    console.error('Error searching activity_logs:', error);
    return;
  }

  console.log('Activity logs mentioning Kristina:', JSON.stringify(messages, null, 2));
}

findKristina();
