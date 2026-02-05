import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jxnqsbkvckvfwgmvuajb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bnFzYmt2Y2t2ZndnbXZ1YWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE5ODkzNiwiZXhwIjoyMDg1Nzc0OTM2fQ._IAuu-bsZgyB7hPTnR9H6--K1przqEr7q_-nOKbt9DM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateTaskStatus(taskId, status) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
    .eq('id', taskId)
  
  if (error) console.error(error)
  else console.log(`Task ${taskId} updated to ${status}`)
}

// Werk Shop Demo - Live Data
updateTaskStatus('1221d6c4-1380-4aab-9334-0f6b7d2a3b16', 'completed')
// Lead Gen & Outreach
updateTaskStatus('946b0d5c-e285-4c2b-aebb-2369f02d65aa', 'completed')
