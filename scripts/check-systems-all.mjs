import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const { data: rows, error } = await supabase.from('systems').select('*');
  if (error) console.error(error);
  else {
      console.log('Systems rows:', rows.length);
      rows.forEach(r => console.log(`- ${r.id}: ${r.hostname}`));
  }
}

check()
