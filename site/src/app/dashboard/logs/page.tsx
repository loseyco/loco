'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase, ActivityLog } from '@/lib/supabase'

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  useEffect(() => {
    fetchLogs()

    // Real-time subscription for live updates
    const subscription = supabase
      .channel('activity-logs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_logs' },
        (payload) => {
          console.log('Activity log change:', payload)
          if (payload.eventType === 'INSERT') {
            setLogs((prev) => [payload.new as ActivityLog, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setLogs((prev) =>
              prev.map((log) => (log.id === payload.new.id ? (payload.new as ActivityLog) : log))
            )
          } else if (payload.eventType === 'DELETE') {
            setLogs((prev) => prev.filter((log) => log.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchLogs() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique agents for filter dropdown
  const uniqueAgents = useMemo(() => {
    const agents = new Set(logs.map((log) => log.agent))
    return Array.from(agents).sort()
  }, [logs])

  // Apply filters
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Agent filter
      if (agentFilter !== 'all' && log.agent !== agentFilter) {
        return false
      }

      // Date from filter
      if (dateFrom) {
        const logDate = new Date(log.created_at)
        const fromDate = new Date(dateFrom)
        fromDate.setHours(0, 0, 0, 0)
        if (logDate < fromDate) return false
      }

      // Date to filter
      if (dateTo) {
        const logDate = new Date(log.created_at)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (logDate > toDate) return false
      }

      return true
    })
  }, [logs, agentFilter, dateFrom, dateTo])

  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  function getAgentColor(agent: string): string {
    // Chase (main agent) gets red, sub-agents get other colors
    if (agent.toLowerCase() === 'chase') {
      return 'bg-red-600/20 text-red-400 border-red-600/30'
    }
    // Hash the agent name to get a consistent color
    const colors = [
      'bg-purple-600/20 text-purple-400 border-purple-600/30',
      'bg-blue-600/20 text-blue-400 border-blue-600/30',
      'bg-cyan-600/20 text-cyan-400 border-cyan-600/30',
      'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
      'bg-amber-600/20 text-amber-400 border-amber-600/30',
      'bg-pink-600/20 text-pink-400 border-pink-600/30',
    ]
    const hash = agent.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  function getActionIcon(action: string): string {
    const lowerAction = action.toLowerCase()
    if (lowerAction.includes('create') || lowerAction.includes('add')) return '➕'
    if (lowerAction.includes('update') || lowerAction.includes('edit')) return '✏️'
    if (lowerAction.includes('delete') || lowerAction.includes('remove')) return '🗑️'
    if (lowerAction.includes('complete') || lowerAction.includes('finish')) return '✅'
    if (lowerAction.includes('start') || lowerAction.includes('begin')) return '🚀'
    if (lowerAction.includes('send') || lowerAction.includes('email')) return '📧'
    if (lowerAction.includes('search') || lowerAction.includes('fetch')) return '🔍'
    if (lowerAction.includes('error') || lowerAction.includes('fail')) return '❌'
    if (lowerAction.includes('spawn') || lowerAction.includes('sub-agent')) return '🤖'
    return '📝'
  }

  function clearFilters() {
    setAgentFilter('all')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters = agentFilter !== 'all' || dateFrom || dateTo

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-zinc-500 mt-1">Real-time feed of what Chase and sub-agents are doing</p>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Agent filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Agent</label>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 transition-colors min-w-[150px]"
            >
              <option value="all">All Agents</option>
              {uniqueAgents.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="self-end px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}

          {/* Results count */}
          <div className="ml-auto self-end text-sm text-zinc-500">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'log' : 'logs'}
            {hasActiveFilters && ` (filtered from ${logs.length})`}
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="divide-y divide-zinc-800 max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p className="text-4xl mb-4">📋</p>
              <p>
                {hasActiveFilters
                  ? 'No logs match your filters'
                  : 'No activity logs yet. Chase will log actions here.'}
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Action icon */}
                  <span className="text-xl mt-0.5">{getActionIcon(log.action)}</span>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Agent badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getAgentColor(
                          log.agent
                        )}`}
                      >
                        {log.agent}
                      </span>

                      {/* Action */}
                      <span className="font-medium text-white">{log.action}</span>

                      {/* Task link */}
                      {log.task_id && (
                        <Link
                          href={`/dashboard/tasks/${log.task_id}`}
                          className="text-xs text-red-400 hover:text-red-300 hover:underline transition-colors"
                        >
                          View Task →
                        </Link>
                      )}
                    </div>

                    {/* Details */}
                    {log.details && (
                      <p className="text-sm text-zinc-400 mt-1 break-words">{log.details}</p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-zinc-500 whitespace-nowrap">
                    {formatTimestamp(log.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p className="text-zinc-500 text-sm">Total Logs</p>
          <p className="text-2xl font-bold text-white">{logs.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p className="text-zinc-500 text-sm">Agents Active</p>
          <p className="text-2xl font-bold text-purple-400">{uniqueAgents.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p className="text-zinc-500 text-sm">Today</p>
          <p className="text-2xl font-bold text-blue-400">
            {
              logs.filter((log) => {
                const today = new Date()
                const logDate = new Date(log.created_at)
                return logDate.toDateString() === today.toDateString()
              }).length
            }
          </p>
        </div>
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p className="text-zinc-500 text-sm">This Hour</p>
          <p className="text-2xl font-bold text-green-400">
            {
              logs.filter((log) => {
                const now = new Date()
                const logDate = new Date(log.created_at)
                return now.getTime() - logDate.getTime() < 60 * 60 * 1000
              }).length
            }
          </p>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Logs update in real-time — no refresh needed</span>
      </div>
    </div>
  )
}
