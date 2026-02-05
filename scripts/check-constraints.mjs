import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const { data, error } = await supabase.rpc('get_check_constraints', { t_name: 'chase_status' });
  if (error) {
    // Fallback: try to guess or just try a few values.
    // Likely values: 'idle', 'working', 'error', 'offline'.
    console.error('RPC Error:', error);
  } else {
    console.log(data);
  }
}

check()
