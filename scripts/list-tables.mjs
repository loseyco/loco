import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'site/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables')
  if (error) {
    // If RPC doesn't exist, try a direct query to information_schema
    const { data: tables, error: sError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
    
    if (sError) {
       // fallback: just try to select from likely tables
       const likely = ['tasks', 'messages', 'leads', 'memory_entries', 'projects']
       for (const table of likely) {
         const { count, error: cError } = await supabase.from(table).select('*', { count: 'exact', head: true })
         console.log(`Table ${table}: ${cError ? 'Error/Missing' : count + ' rows'}`)
       }
    } else {
      tables.forEach(t => console.log(t.tablename))
    }
  } else {
    console.log(data)
  }
}

listTables()
