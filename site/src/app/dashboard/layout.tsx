'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { signOut } from '@/app/login/actions'
import { supabase, SystemStats } from '@/lib/supabase'

import { ViewContext } from '@/lib/ViewContext'
import FloatingQuickTask from '@/components/FloatingQuickTask'

interface ChaseStatus {
  status: 'working' | 'idle'
  current_task: string | null
  last_action: string | null
  updated_at: string
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/staff', label: 'Staff', icon: '🛠️' },
  { href: '/dashboard/work', label: 'Found Work', icon: '🔍' },
  { href: '/dashboard/projects', label: 'Projects', icon: '📁' },
  { href: '/dashboard/tasks', label: 'Tasks', icon: '✅' },
  { href: '/dashboard/invoices', label: 'Invoices', icon: '🧾' },
  { href: '/dashboard/finance', label: 'Finance', icon: '💰' },
  { href: '/dashboard/chat', label: 'Chat', icon: '💬' },
  { href: '/dashboard/changelog', label: 'Changelog', icon: '📝' },
  { href: '/dashboard/logs', label: 'Logs', icon: '📋' },
]

const demoItems = [
  { href: '/demo/werk-shop', label: 'Werk Shop', icon: '🚙' },
  { href: '/demo/davidson-racing', label: 'Davidson Racing', icon: '🏎️' },
]

const externalLinks = [
  { href: 'https://github.com/loseyco/loco', label: 'GitHub Repo', icon: '🐙' },
  { href: 'https://vercel.com/loseyco/loco', label: 'Vercel Deploy', icon: '▲' },
]

function ChaseStatusBar() {
  const [status, setStatus] = useState<ChaseStatus | null>(null)
  const [latestLog, setLatestLog] = useState<{ agent: string; action: string; created_at: string } | null>(null)
  const [pcStats, setPcStats] = useState<SystemStats | null>(null)

  useEffect(() => {
    fetchStatus()
    fetchLatestLog()
    fetchPcStats()

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

    // Subscribe to PC telemetry
    const telemetryChannel = supabase
      .channel('pc-telemetry')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'systems', filter: 'id=eq.main-pc' }, (payload) => {
        setPcStats(payload.new as SystemStats)
      })
      .subscribe()

    // Poll every 30 seconds as backup
    const interval = setInterval(() => {
      fetchStatus()
      fetchLatestLog()
      fetchPcStats()
    }, 30000)

    return () => {
      supabase.removeChannel(statusChannel)
      supabase.removeChannel(logsChannel)
      supabase.removeChannel(telemetryChannel)
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

  async function fetchPcStats() {
    const { data } = await supabase.from('systems').select('*').eq('id', 'main-pc').single()
    if (data) setPcStats(data)
  }

  const isWorking = status?.status === 'working'
  const timeSinceUpdate = latestLog ? Math.floor((Date.now() - new Date(latestLog.created_at).getTime()) / 60000) : null
  const pcOnline = pcStats && (Date.now() - new Date(pcStats.last_seen).getTime()) < 60000

  return (
    <div className={`px-4 py-2 border-b flex flex-col md:flex-row md:items-center justify-between text-sm gap-2 ${isWorking ? 'bg-green-950/50 border-green-800/50' : 'bg-zinc-900/50 border-zinc-800'
      }`}>
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isWorking ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
          <span className="font-medium whitespace-nowrap">
            {isWorking ? '⚡ Chase is working' : '⏸️ Chase is idle'}
          </span>
          {status?.current_task && (
            <span className="text-zinc-400 truncate max-w-[200px] md:max-w-none">
              on: <span className="text-white">{status.current_task}</span>
            </span>
          )}
        </div>

        {pcStats && (
          <div className="flex items-center gap-4 text-xs md:border-l border-zinc-800 md:pl-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pcOnline ? 'bg-blue-500' : 'bg-zinc-600'}`} />
              <span className="text-zinc-500 uppercase tracking-wider font-bold whitespace-nowrap">PC Host</span>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <span className="text-zinc-500 whitespace-nowrap">CPU <span className={pcStats.cpu_usage > 80 ? 'text-red-400' : 'text-zinc-300'}>{pcStats.cpu_usage}%</span></span>
              <span className="text-zinc-500 whitespace-nowrap">MEM <span className={pcStats.memory_usage > 80 ? 'text-red-400' : 'text-zinc-300'}>{pcStats.memory_usage}%</span></span>
            </div>

            {/* PM2 Processes */}
            {pcStats.metadata?.pm2 && (
              <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-zinc-800/50">
                {pcStats.metadata.pm2.map((proc) => (
                  <div key={proc.name} className="flex items-center gap-1.5 group relative" title={`${proc.name}: ${proc.status}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${proc.status === 'online' ? 'bg-emerald-500' :
                      proc.status === 'stopped' ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-tight font-medium group-hover:text-zinc-300 transition-colors whitespace-nowrap">
                      {proc.name.replace('openclaw-', '')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-zinc-500 text-xs md:text-sm">
        {latestLog && (
          <span className="truncate">
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'admin' | 'user'>('admin')

  // Filter items based on viewMode
  const visibleNavItems = viewMode === 'admin'
    ? navItems
    : navItems.filter(item => ['Projects', 'Tasks'].includes(item.label));

  return (
    <ViewContext.Provider value={{ viewMode, setViewMode }}>
      <div className="min-h-screen bg-black text-white flex flex-col md:flex-row relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-500">Losey</span>
            <span className="text-xl font-light text-zinc-400">.co</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-zinc-400 hover:text-white"
          >
            <span className="text-2xl">{isSidebarOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Sidebar Overlay (Mobile) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col z-50
        transition-transform duration-300 md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
          {/* Logo (Desktop) */}
          <div className="p-6 border-b border-zinc-800 hidden md:block">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-500">Losey</span>
              <span className="text-2xl font-light text-zinc-400">.co</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
            {/* Management Links */}
            <div className="space-y-2">
              <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Management</p>
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-red-600/20 text-red-500 border border-red-600/30'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Demos & Spec - HIDDEN IN USER MODE */}
            {viewMode === 'admin' && (
              <div className="space-y-2">
                <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Demos & Spec</p>
                {demoItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                        ? 'bg-red-600/20 text-red-500 border border-red-600/30'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* External Links - HIDDEN IN USER MODE */}
            {viewMode === 'admin' && (
              <div className="space-y-2">
                <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">External</p>
                {externalLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </nav>

          {/* View Mode Toggle & Sign Out */}
          <div className="p-4 border-t border-zinc-800 space-y-4">
            {/* View Mode Switcher */}
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <button
                onClick={() => setViewMode('admin')}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${viewMode === 'admin'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                PJ (Admin)
              </button>
              <button
                onClick={() => setViewMode('user')}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${viewMode === 'user'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                Kristina
              </button>
            </div>

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
        <main className="flex-1 overflow-x-hidden flex flex-col">
          {/* Chase Status Bar */}
          <ChaseStatusBar />

          {/* Page content */}
          <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
            {children}
          </div>
          <FloatingQuickTask />
        </main>
      </div>
    </ViewContext.Provider >
  )
}
