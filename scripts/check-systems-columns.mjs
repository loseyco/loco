import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const { data: cols, error } = await supabase.rpc('get_table_columns', { table_name: 'systems' });
  if (error) console.error(error);
  else console.log(cols);
}

check()
