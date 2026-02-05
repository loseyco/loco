import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../site/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const initialEntries = [
  {
    title: 'Fuel Gauge',
    description: 'Added a real-time API usage monitor (Tokens/Min, Requests/Min, Requests/Day) to the dashboard to track LLM costs and limits.',
    category: 'feature',
    version: '0.2.0',
    created_at: new Date('2026-02-04T10:00:00Z').toISOString(),
  },
  {
    title: 'Task Controls',
    description: 'Implemented granular task management with priority levels, status tracking, and automated sub-agent assignment.',
    category: 'feature',
    version: '0.1.5',
    created_at: new Date('2026-02-03T15:00:00Z').toISOString(),
  },
  {
    title: 'Staff Console',
    description: 'New management interface for viewing and managing staff members and their active agent sessions.',
    category: 'feature',
    version: '0.1.2',
    created_at: new Date('2026-02-02T09:00:00Z').toISOString(),
  },
  {
    title: 'Supabase Realtime Integration',
    description: 'Fixed an issue where dashboard stats wouldn\'t update without a page refresh. Now using Supabase Realtime for instant updates.',
    category: 'fix',
    version: '0.1.1',
    created_at: new Date('2026-02-01T14:00:00Z').toISOString(),
  }
]

async function seed() {
  console.log('Seeding changelog...')
  
  // First check if table exists by trying to select from it
  const { error: checkError } = await supabase.from('changelog').select('id').limit(1)
  
  if (checkError) {
    console.error('Error checking changelog table (it might not exist yet):', checkError.message)
    console.log('Please ensure the table is created in Supabase first.')
    return
  }

  const { data, error } = await supabase
    .from('changelog')
    .insert(initialEntries)
    .select()

  if (error) {
    console.error('Error seeding changelog:', error)
  } else {
    console.log('Successfully seeded changelog:', data.length, 'entries')
  }
}

seed()
