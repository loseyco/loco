import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const tables = ['system_stats', 'api_usage', 'agent_status', 'chase_status', 'systems']
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    console.log(`Table ${table}: ${error ? 'Missing' : 'Exists'}`)
  }
}

check()
