import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jxnqsbkvckvfwgmvuajb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bnFzYmt2Y2t2ZndnbXZ1YWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE5ODkzNiwiZXhwIjoyMDg1Nzc0OTM2fQ._IAuu-bsZgyB7hPTnR9H6--K1przqEr7q_-nOKbt9DM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkInvoicesSchema() {
  const { data, error } = await supabase.from('invoices').select('*').limit(1)
  if (error) console.error(error)
  else console.log('Invoices Columns:', Object.keys(data[0] || {}))
}

checkInvoicesSchema()
