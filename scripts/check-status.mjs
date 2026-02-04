import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'site/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  console.log('Checking for new messages...')
  const { data: messages, error: mError } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (mError) console.error('Error fetching messages:', mError)
  else {
    console.log('Recent messages:')
    messages.forEach(m => console.log(`- [${m.created_at}] ${m.sender}: ${m.text}`))
  }

  console.log('\nChecking tasks...')
  const { data: tasks, error: tError } = await supabase
    .from('tasks')
    .select('*')
    .order('priority', { ascending: false })

  if (tError) console.error('Error fetching tasks:', tError)
  else {
    console.log('Tasks:')
    tasks.forEach(t => console.log(`- [${t.status}] [P${t.priority}] ${t.title}`))
  }
}

check()
