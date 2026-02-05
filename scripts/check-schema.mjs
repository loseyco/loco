import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jxnqsbkvckvfwgmvuajb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bnFzYmt2Y2t2ZndnbXZ1YWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE5ODkzNiwiZXhwIjoyMDg1Nzc0OTM2fQ._IAuu-bsZgyB7hPTnR9H6--K1przqEr7q_-nOKbt9DM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'projects' })
  
  if (error) {
    // If RPC doesn't exist, try selecting one row to see what we get
    const { data: row, error: selectError } = await supabase.from('projects').select('*').limit(1)
    if (selectError) {
      console.error(selectError)
    } else {
      console.log('Columns:', Object.keys(row[0] || {}))
    }
    return
  }
  
  console.log(data)
}

checkSchema()
