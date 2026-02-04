import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client only if we have valid credentials
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Types for our tables
export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id?: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface AgentSession {
  id: string
  started_at: string
  ended_at?: string
  status: 'active' | 'completed' | 'error'
  messages_count: number
}

export interface MemoryEntry {
  id: string
  content: string
  type: string
  created_at: string
}

// Invoice types
export interface Invoice {
  id: string
  client_name: string
  client_email: string
  amount: number
  description: string
  status: 'draft' | 'sent' | 'paid'
  payment_url?: string
  stripe_session_id?: string
  created_at: string
  updated_at: string
}

// Activity log types
export interface ActivityLog {
  id: string
  agent: string
  action: string
  details?: string
  task_id?: string
  created_at: string
}
