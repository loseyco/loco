'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { signOut } from '@/app/login/actions'
import { supabase } from '@/lib/supabase'

interface ChaseStatus {
  status: 'working' | 'idle'
  current_task: string | null
  last_action: string | null
  updated_at: string
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/projects', label: 'Projects', icon: '📁' },
  { href: '/dashboard/tasks', label: 'Tasks', icon: '✅' },
  { href: '/dashboard/invoices', label: 'Invoices', icon: '🧾' },
  { href: '/dashboard/finance', label: 'Finance', icon: '💰' },
  { href: '/dashboard/chat', label: 'Chat', icon: '💬' },
  { href: '/dashboard/logs', label: 'Logs', icon: '📋' },
]

function ChaseStatusBar() {
  const [status, setStatus] = useState<ChaseStatus | null>(null)
  const [latestLog, setLatestLog] = useState<{ agent: string; action: string; created_at: string } | null>(null)

  useEffect(() => {
    fetchStatus()
    fetchLatestLog()

    // Subscribe to status changes
    const statusChannel = supabase
      .channel('chase-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chase_status' }, () => {
        fetchStatus()
      })
      .subscribe()

    // Subscribe to activity log changes
    const logsChannel = supabase
      .channel('latest-activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, () => {
        fetchLatestLog()
      })
      .subscribe()

    // Poll every 30 seconds as backup
    const interval = setInterval(() => {
      fetchStatus()
      fetchLatestLog()
    }, 30000)

    return () => {
      supabase.removeChannel(statusChannel)
      supabase.removeChannel(logsChannel)
      clearInterval(interval)
    }
  }, [])

  async function fetchStatus() {
    const { data } = await supabase.from('chase_status').select('*').single()
    if (data) setStatus(data)
  }

  async function fetchLatestLog() {
    const { data } = await supabase
      .from('activity_logs')
      .select('agent, action, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data) setLatestLog(data)
  }

  const isWorking = status?.status === 'working'
  const timeSinceUpdate = latestLog ? Math.floor((Date.now() - new Date(latestLog.created_at).getTime()) / 60000) : null

  return (
    <div className={`px-4 py-2 border-b flex items-center justify-between text-sm ${
      isWorking ? 'bg-green-950/50 border-green-800/50' : 'bg-zinc-900/50 border-zinc-800'
    }`}>
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full ${isWorking ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
        <span className="font-medium">
          {isWorking ? '⚡ Chase is working' : '⏸️ Chase is idle'}
        </span>
        {status?.current_task && (
          <span className="text-zinc-400">
            on: <span className="text-white">{status.current_task}</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 text-zinc-500">
        {latestLog && (
          <span>
            Last: <span className="text-zinc-300">{latestLog.action}</span>
            {timeSinceUpdate !== null && timeSinceUpdate > 0 && (
              <span className="text-zinc-600"> ({timeSinceUpdate}m ago)</span>
            )}
          </span>
        )}
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-500">Losey</span>
            <span className="text-2xl font-light text-zinc-400">.co</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600/20 text-red-500 border border-red-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign out and status */}
        <div className="p-4 border-t border-zinc-800 space-y-4">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Sign Out</span>
            </button>
          </form>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Real-time connected</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Chase Status Bar */}
        <ChaseStatusBar />
        
        {/* Page content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
