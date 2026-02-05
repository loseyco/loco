import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
    const likely = ['client', 'notes', 'metadata', 'items', 'project_id', 'client_name'];
    console.log('Trying more fallback selects...');
    for (const col of likely) {
        const { error: e } = await supabase.from('invoices').select(col).limit(1);
        console.log(`Column ${col}: ${e ? 'Missing' : 'Exists'}`);
    }
}

check()
