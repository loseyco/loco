import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const { data, error } = await supabase.from('invoices').select('*').limit(1);
  if (error) console.error(error);
  else console.log('Invoices columns:', Object.keys(data[0] || {}));
}

check()
