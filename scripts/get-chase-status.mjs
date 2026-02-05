import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jxnqsbkvckvfwgmvuajb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bnFzYmt2Y2t2ZndnbXZ1YWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE5ODkzNiwiZXhwIjoyMDg1Nzc0OTM2fQ._IAuu-bsZgyB7hPTnR9H6--K1przqEr7q_-nOKbt9DM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function getStatus() {
  const { data, error } = await supabase.from('chase_status').select('*').single()
  if (error) console.error(error)
  else console.log(JSON.stringify(data, null, 2))
}

getStatus()
