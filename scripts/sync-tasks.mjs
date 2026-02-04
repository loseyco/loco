import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'site/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function sync() {
  console.log('Syncing tasks...')
  
  // Finance Dashboard completed
  await supabase
    .from('tasks')
    .update({ status: 'completed' })
    .ilike('title', '%Finance Dashboard%')

  // Werk Shop demo in_progress
  await supabase
    .from('tasks')
    .update({ status: 'in_progress' })
    .ilike('title', '%The Werk Shop%')

  console.log('Sync complete.')
}

sync()
