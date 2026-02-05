import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const { data: usage, error: uError } = await supabase.from('api_usage').select('*').limit(1);
  if (uError) console.error('api_usage error:', uError);
  else console.log('api_usage columns:', Object.keys(usage[0] || {}));

  const { data: systems, error: sError } = await supabase.from('systems').select('*').limit(1);
  if (sError) console.error('systems error:', sError);
  else console.log('systems columns:', Object.keys(systems[0] || {}));

  const { data: chase, error: cError } = await supabase.from('chase_status').select('*').limit(1);
  if (cError) console.error('chase_status error:', cError);
  else console.log('chase_status columns:', Object.keys(chase[0] || {}));
}

check()
