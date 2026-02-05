'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, Project, Task, AgentSession, AgentStatus, SystemStats } from '@/lib/supabase'

interface Stats {
  totalProjects: number
  activeTasks: number
  completedTasks: number
  agentSessions: number
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    agentSessions: 0,
  })
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [apiUsage, setApiUsage] = useState<any[]>([])
  const [usageStats, setUsageStats] = useState({
    tpm: 0,
    rpm: 0,
    rpd: 0,
    tpmPercent: 0,
    rpmPercent: 0,
    rpdPercent: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    
    // Real-time subscriptions
    const projectsSub = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchData()
      })
      .subscribe()

    const tasksSub = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchData()
      })
      .subscribe()

    const statusSub = supabase
      .channel('agent-status-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_status' }, (payload) => {
        setAgentStatus(payload.new as AgentStatus)
      })
      .subscribe()

    const sysSub = supabase
      .channel('system-stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_stats' }, (payload) => {
        setSystemStats(payload.new as SystemStats)
      })
      .subscribe()

    const usageSub = supabase
      .channel('api-usage-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'api_usage' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      projectsSub.unsubscribe()
      tasksSub.unsubscribe()
      statusSub.unsubscribe()
      sysSub.unsubscribe()
      usageSub.unsubscribe()
    }
  }, [])

  async function fetchData() {
    try {
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60000).toISOString()
      const todayStart = new Date(now.setHours(0,0,0,0)).toISOString()

      const [projectsRes, tasksRes, sessionsRes, statusRes, sysRes, usageRes, minUsageRes, dayUsageRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('tasks').select('*'),
        supabase.from('agent_sessions').select('*'),
        supabase.from('agent_status').select('*').eq('agent_id', 'ops').single(),
        supabase.from('system_stats').select('*').order('last_seen', { ascending: false }).limit(1).single(),
        supabase.from('api_usage').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('api_usage').select('total_tokens').gte('created_at', oneMinuteAgo),
        supabase.from('api_usage').select('id').gte('created_at', todayStart)
      ])

      const projects = projectsRes.data || []
      const tasks = tasksRes.data || []
      const sessions = sessionsRes.data || []
      
      const usedTPM = (minUsageRes.data || []).reduce((sum, row) => sum + (row.total_tokens || 0), 0)
      const usedRPM = (minUsageRes.data || []).length
      const usedRPD = (dayUsageRes.data || []).length

      setStats({
        totalProjects: projects.length,
        activeTasks: tasks.filter((t: Task) => t.status !== 'completed').length,
        completedTasks: tasks.filter((t: Task) => t.status === 'completed').length,
        agentSessions: sessions.length,
      })
      
      setUsageStats({
        tpm: usedTPM,
        rpm: usedRPM,
        rpd: usedRPD,
        tpmPercent: (usedTPM / 1000000) * 100,
        rpmPercent: (usedRPM / 15) * 100,
        rpdPercent: (usedRPD / 1500) * 100
      })

      setRecentProjects(projects.slice(0, 5))
      setAgentStatus(statusRes.data)
      setSystemStats(sysRes.data)
      setApiUsage(usageRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: '📁', color: 'from-red-600 to-red-800' },
    { label: 'Active Tasks', value: stats.activeTasks, icon: '🔥', color: 'from-orange-600 to-orange-800' },
    { label: 'Completed', value: stats.completedTasks, icon: '✅', color: 'from-green-600 to-green-800' },
    { label: 'Agent Sessions', value: stats.agentSessions, icon: '🤖', color: 'from-purple-600 to-purple-800' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Real-time overview of your workspace</p>
        </div>
        
        {systemStats && (
          <div className="flex gap-4 text-xs font-mono bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
            <div>
              <span className="text-zinc-500 uppercase">CPU</span>
              <p className="text-red-500">{systemStats.cpu_usage.toFixed(1)}%</p>
            </div>
            <div className="w-px bg-zinc-800" />
            <div>
              <span className="text-zinc-500 uppercase">MEM</span>
              <p className="text-orange-500">{systemStats.memory_usage.toFixed(1)}%</p>
            </div>
            <div className="w-px bg-zinc-800" />
            <div>
              <span className="text-zinc-500 uppercase">PC</span>
              <p className="text-green-500">ONLINE</p>
            </div>
          </div>
        )}
      </div>

      {/* Agent Status Card (NEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="bg-red-600/10 border-b border-red-600/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h2 className="font-bold text-red-500 uppercase tracking-widest text-sm">Chase Status</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              UPDATED: {agentStatus ? new Date(agentStatus.updated_at).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Current Goal</p>
              <p className="text-xl font-medium text-white">{agentStatus?.current_goal || 'Waiting for tasks...'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Internal Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-sm text-zinc-300">{agentStatus?.status_text || 'Active'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Staff (Pi Engine)</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${agentStatus?.staff_online ? 'bg-blue-500 animate-pulse' : 'bg-zinc-600'}`} />
                  <p className={`text-sm font-bold ${agentStatus?.staff_online ? 'text-blue-400' : 'text-zinc-500'}`}>
                    {agentStatus?.staff_online ? 'ONLINE' : 'OFFLINE'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Active Sub-Agents</p>
                <p className="text-lg font-bold text-white">{agentStatus?.active_subagents || 0}</p>
              </div>
            </div>

            {agentStatus?.blocked_reason && (
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-xs font-mono text-orange-500 uppercase tracking-widest">Blocked On PJ</p>
                  <p className="text-sm text-zinc-300">{agentStatus.blocked_reason}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Task Peek */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
           <div className="p-4 border-b border-zinc-800">
             <h2 className="font-bold text-sm uppercase tracking-widest text-zinc-400">Queue Items</h2>
           </div>
           <div className="p-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                   <span className="text-zinc-500 font-mono text-xs">01</span>
                   <p className="text-xs text-zinc-400">Stable gateway monitoring (5m interval)</p>
                </div>
                <div className="flex gap-3">
                   <span className="text-zinc-500 font-mono text-xs">02</span>
                   <p className="text-xs text-zinc-400">Wiring Werk Shop demo to live DB</p>
                </div>
                <div className="flex gap-3">
                   <span className="text-zinc-500 font-mono text-xs">03</span>
                   <p className="text-xs text-zinc-400">Scaffolding Motorsports Playbook</p>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <span className="text-4xl opacity-50">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fuel Gauge Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>⛽</span> Fuel Gauge (API Usage)
          </h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${usageStats.tpmPercent > 80 || usageStats.rpmPercent > 80 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
            {usageStats.tpmPercent > 80 || usageStats.rpmPercent > 80 ? 'LOW FUEL' : 'TANK FULL'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">TPM (Tokens/Min)</span>
              <span className="text-zinc-300 font-mono">{usageStats.tpm.toLocaleString()} / 1,000,000</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usageStats.tpmPercent, 100)}%` }}
                className={`h-full ${usageStats.tpmPercent > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
              />
            </div>
            <p className="text-[10px] text-zinc-500 font-mono text-right">{usageStats.tpmPercent.toFixed(1)}%</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">RPM (Requests/Min)</span>
              <span className="text-zinc-300 font-mono">{usageStats.rpm} / 15</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usageStats.rpmPercent, 100)}%` }}
                className={`h-full ${usageStats.rpmPercent > 80 ? 'bg-red-500' : 'bg-green-500'}`}
              />
            </div>
            <p className="text-[10px] text-zinc-500 font-mono text-right">{usageStats.rpmPercent.toFixed(1)}%</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">RPD (Requests/Day)</span>
              <span className="text-zinc-300 font-mono">{usageStats.rpd.toLocaleString()} / 1,500</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usageStats.rpdPercent, 100)}%` }}
                className={`h-full ${usageStats.rpdPercent > 80 ? 'bg-red-500' : 'bg-purple-500'}`}
              />
            </div>
            <p className="text-[10px] text-zinc-500 font-mono text-right">{usageStats.rpdPercent.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Projects</h2>
            <span className="text-xs font-mono text-zinc-500">SYNCED LIVE</span>
            </div>
            <div className="divide-y divide-zinc-800">
            {recentProjects.length === 0 ? (
                <div className="p-6 text-center text-zinc-500">No projects yet</div>
            ) : (
                recentProjects.map((project) => (
                <div
                    key={project.id}
                    className="p-4 hover:bg-zinc-800/50 transition-colors flex items-center justify-between"
                >
                    <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-zinc-500">{project.description || 'No description'}</p>
                    </div>
                    <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active'
                        ? 'bg-green-600/20 text-green-400'
                        : project.status === 'completed'
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'bg-zinc-600/20 text-zinc-400'
                    }`}
                    >
                    {project.status}
                    </span>
                </div>
                ))
            )}
            </div>
        </div>

        {/* API Usage (NEW) */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold">API Usage & Limits</h2>
            <span className="text-xs font-mono text-zinc-500">LATEST LOCO BRAIN</span>
            </div>
            <div className="divide-y divide-zinc-800">
            {apiUsage.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">
                    <p>No usage data logged yet.</p>
                </div>
            ) : (
                apiUsage.map((u) => (
                <div key={u.id} className="p-4 hover:bg-zinc-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-zinc-300 uppercase tracking-tighter">{u.model}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${u.status === 'rate_limit' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                            {u.status.toUpperCase()}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                        <span>{u.total_tokens.toLocaleString()} tokens</span>
                        <span>{new Date(u.created_at).toLocaleTimeString()}</span>
                    </div>
                </div>
                ))
            )}
            </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>System connected to Supabase Realtime</span>
      </div>
    </div>
  )
}
