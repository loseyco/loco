import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'invoices' });
  if (error) {
      console.error(error);
      // Fallback: try common column names
      const likely = ['id', 'client_id', 'amount', 'status', 'description', 'created_at', 'invoice_number'];
      console.log('Trying fallback selects...');
      for (const col of likely) {
          const { error: e } = await supabase.from('invoices').select(col).limit(1);
          console.log(`Column ${col}: ${e ? 'Missing' : 'Exists'}`);
      }
  } else {
      console.log(data);
  }
}

check()
