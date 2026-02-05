import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'site/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: cStatus } = await supabase.from('chase_status').select('*').limit(1);
  console.log('chase_status columns:', Object.keys(cStatus?.[0] || {}));

  const { data: systems } = await supabase.from('systems').select('*').limit(1);
  console.log('systems columns:', Object.keys(systems?.[0] || {}));
}

check();
