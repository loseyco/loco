import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deprioritizeWerkShop() {
  const { error } = await supabase
    .from('tasks')
    .update({ priority: 0, status: 'pending' })
    .ilike('title', '%werk%');

  if (error) console.error('Error deprioritizing Werk Shop:', error);
  else console.log('Successfully deprioritized Werk Shop tasks.');
}

deprioritizeWerkShop();
