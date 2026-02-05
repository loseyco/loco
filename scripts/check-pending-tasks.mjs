import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'site/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${tasks.length} pending tasks.`)
  tasks.forEach(t => console.log(`- [P${t.priority}] ${t.title}`))
}

check()
