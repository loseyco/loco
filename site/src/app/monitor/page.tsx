'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, SystemStats } from '@/lib/supabase'

export default function MonitorPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [chaseStatus, setChaseStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restarting, setRestarting] = useState(false)

  useEffect(() => {
    fetchStats()

    // Real-time subscription to 'systems' table
    const systemsSub = supabase
      .channel('systems-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'systems' }, (payload) => {
        setStats(payload.new as SystemStats)
      })
      .subscribe()

    // Real-time subscription to 'chase_status'
    const statusSub = supabase
      .channel('chase-status-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chase_status' }, (payload) => {
        setChaseStatus(payload.new)
      })
      .subscribe()

    // Refresh every 30s as backup
    const interval = setInterval(fetchStats, 30000)

    return () => {
      systemsSub.unsubscribe()
      statusSub.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  async function fetchStats() {
    try {
      const [sysRes, statusRes] = await Promise.all([
        supabase.from('systems').select('*').eq('id', 'main-pc').single(),
        supabase.from('chase_status').select('*').limit(1).single()
      ])

      if (sysRes.error) throw sysRes.error
      setStats(sysRes.data)
      setChaseStatus(statusRes.data)
    } catch (err: any) {
      console.error('Error fetching stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRestart() {
    if (!confirm('Are you sure you want to restart the gateway?')) return
    
    setRestarting(true)
    try {
      const res = await fetch('/api/system/restart', { method: 'POST' })
      const result = await res.json()
      if (result.success) {
        alert('Restart triggered successfully!')
      } else {
        alert('Failed to restart: ' + result.message)
      }
    } catch (err) {
      alert('Error triggering restart')
    } finally {
      setRestarting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-red-500 font-mono">
        <div className="text-xl animate-pulse">BOOTING MONITOR...</div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-red-500 font-mono p-4">
        <div className="text-2xl mb-4">SYSTEM ERROR</div>
        <div className="text-xs break-all">{error}</div>
        <button onClick={fetchStats} className="mt-4 px-4 py-2 border border-red-500 hover:bg-red-500 hover:text-black">RETRY</button>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-black text-zinc-300 font-mono overflow-hidden flex flex-col p-4 select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <h1 className="text-xl font-bold tracking-tighter text-white">MAIN RIG MONITOR</h1>
        </div>
        <div className="text-[10px] text-zinc-500 text-right">
          <div>HOST: {stats?.hostname || 'N/A'}</div>
          <div>LAST SYNC: {stats ? new Date(stats.last_seen).toLocaleTimeString() : 'N/A'}</div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Left Column: Core Stats */}
        <div className="space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg relative overflow-hidden h-[180px]">
            <div className="text-[10px] text-zinc-500 uppercase mb-1">CPU LOAD</div>
            <div className="text-5xl font-bold text-red-500">{stats?.cpu_usage?.toFixed(1) || '0.0'}%</div>
            <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${stats?.cpu_usage || 0}%` }}
                className="h-full bg-red-600"
              />
            </div>
            <div className="mt-6 flex justify-between items-end">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">UPTIME</div>
                <div className="text-sm font-bold text-white">
                  {stats ? Math.floor(stats.uptime_seconds / 3600) : 0}H {stats ? Math.floor((stats.uptime_seconds % 3600) / 60) : 0}M
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-500 uppercase">STATUS</div>
                <div className="text-sm font-bold text-green-500">OPTIMAL</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg h-[180px]">
            <div className="text-[10px] text-zinc-500 uppercase mb-1">MEM USAGE</div>
            <div className="text-5xl font-bold text-orange-500">{stats?.memory_usage?.toFixed(1) || '0.0'}%</div>
            <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${stats?.memory_usage || 0}%` }}
                className="h-full bg-orange-600"
              />
            </div>
          </div>
        </div>

        {/* Right Column: PM2 & Actions */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg flex flex-col overflow-hidden">
            <div className="bg-zinc-800/50 px-3 py-1 border-b border-zinc-800 text-[10px] font-bold">PM2 PROCESSES</div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {stats?.metadata?.pm2?.map((p) => (
                <div key={p.name} className="flex justify-between items-center text-[11px] bg-black/30 p-1.5 border border-zinc-800/50 rounded">
                  <span className="truncate w-24 font-bold text-zinc-400">{p.name}</span>
                  <div className="flex gap-3">
                    <span className={p.status === 'online' ? 'text-green-500' : 'text-red-500'}>{p.status.toUpperCase()}</span>
                    <span className="text-zinc-600">{p.cpu}%</span>
                  </div>
                </div>
              ))}
              {!stats?.metadata?.pm2 && <div className="text-center text-zinc-600 py-4 text-xs">NO DATA</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleRestart}
              disabled={restarting}
              className={`py-3 rounded border font-bold text-xs flex items-center justify-center gap-2 transition-all
                ${restarting ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-red-900/20 border-red-900/50 text-red-500 hover:bg-red-500 hover:text-black'}`}
            >
              <span>🔄</span> {restarting ? 'RESTARTING...' : 'RESTART GATEWAY'}
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded font-bold text-xs"
            >
              REFRESH
            </button>
          </div>
        </div>
      </div>

      {/* Chase Status Bar */}
      <div className="mt-4 bg-zinc-900/80 border border-zinc-800 p-2 rounded flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">CHASE</span>
          <span className="text-xs text-white font-bold truncate">
            {chaseStatus?.current_task || 'IDLE'}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${chaseStatus?.status === 'idle' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
            <span className="text-[10px] text-zinc-400 uppercase">{chaseStatus?.status || 'OFFLINE'}</span>
          </div>
          <span className="text-[10px] text-zinc-600 font-mono">
            {chaseStatus?.updated_at ? new Date(chaseStatus.updated_at).toLocaleTimeString() : '--:--:--'}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-2 pt-1 border-t border-zinc-900 flex justify-between text-[8px] text-zinc-700 uppercase tracking-widest">
        <div>SYS: x64_WIN32 // LOCO_OS v2.4.1</div>
        <div className="flex gap-4">
          <span>NET: STABLE</span>
          <span>DB: CONNECTED</span>
        </div>
      </div>
    </div>
  )
}
