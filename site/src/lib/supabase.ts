import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client - use a dummy for SSG/build time if env vars not available
let supabase: SupabaseClient

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Placeholder client for build time - will be replaced at runtime
  supabase = createClient(
    'https://jxnqsbkvckvfwgmvuajb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
  )
}

export { supabase }
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Types for our tables
export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  budget?: number
  client?: string
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface ProjectNote {
  id: string
  project_id: string
  author: string
  content: string
  created_at: string
  updated_at?: string
}

export interface TimeEntry {
  id: string
  project_id?: string
  task_id?: string
  description: string
  minutes: number
  date: string
  created_at: string
  updated_at?: string
}

export interface Task {
  id: string
  project_id?: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: number // 0=low, 1=medium, 2=high
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

// Finance types
export interface ExpenseCategory {
  id: string
  name: string
  icon: string
  color: string
  created_at: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category_id?: string
  category?: ExpenseCategory
  vendor?: string
  date: string
  receipt_url?: string
  notes?: string
  is_deductible: boolean
  created_at: string
  updated_at: string
}

export interface MileageLog {
  id: string
  date: string
  description: string
  miles: number
  deduction_rate: number
  created_at: string
  updated_at: string
}

export interface SystemStats {
  id: string
  hostname: string
  cpu_usage: number
  memory_usage: number
  uptime_seconds: number
  last_seen: string
}

export interface AgentStatus {
  id: string
  agent_id: string
  current_goal: string
  status_text: string
  last_heartbeat: string
  active_subagents: number
  blocked_reason?: string
  delays?: any
  updated_at: string
}
