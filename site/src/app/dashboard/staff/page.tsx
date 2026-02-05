'use client'

import { useEffect, useState } from 'react'
import { supabase, SystemStats } from '@/lib/supabase'

export default function StaffDashboard() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [usageStats, setUsageStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    
    const sysSub = supabase
      .channel('system-stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_stats' }, (payload) => {
        setSystemStats(payload.new as SystemStats)
      })
      .subscribe()

    const usageSub = supabase
      .channel('api-usage-any')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'api_usage' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      sysSub.unsubscribe()
      usageSub.unsubscribe()
    }
  }, [])

  async function fetchData() {
    try {
      const [sysRes, usageRes] = await Promise.all([
        supabase.from('systems').select('*').eq('id', 'main-pc').single(),
        supabase.from('api_usage').select('agent_id, model, total_tokens')
      ])

      if (sysRes.data) setSystemStats(sysRes.data)
      
      if (usageRes.data) {
        const aggregated = usageRes.data.reduce((acc: any, curr) => {
          const key = `${curr.agent_id}-${curr.model}`
          if (!acc[key]) {
            acc[key] = { agent: curr.agent_id, model: curr.model, total: 0 }
          }
          acc[key].total += curr.total_tokens
          return acc
        }, {})
        setUsageStats(Object.values(aggregated))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatUptime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Staff Console</h1>
        <p className="text-zinc-500 mt-1">Advanced system and process monitoring</p>
      </div>

      {systemStats ? (
        <div className="space-y-8">
          {/* Host Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <p className="text-zinc-500 text-sm uppercase tracking-wider font-semibold">Hostname</p>
              <p className="text-2xl font-bold mt-1 text-white">{systemStats.hostname}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <p className="text-zinc-500 text-sm uppercase tracking-wider font-semibold">System Uptime</p>
              <p className="text-2xl font-bold mt-1 text-white">{formatUptime(systemStats.uptime_seconds)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <p className="text-zinc-500 text-sm uppercase tracking-wider font-semibold">Global Health</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <p className="text-2xl font-bold text-white uppercase">Operational</p>
              </div>
            </div>
          </div>

          {/* PM2 Processes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-800/50 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="font-bold text-sm uppercase tracking-widest text-zinc-400">Managed Processes (PM2)</h2>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Last Sync: {new Date(systemStats.last_seen).toLocaleTimeString()}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">CPU</th>
                    <th className="px-6 py-4 font-semibold text-right">Memory</th>
                    <th className="px-6 py-4 font-semibold text-right">Restarts</th>
                    <th className="px-6 py-4 font-semibold text-right">Uptime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {systemStats.metadata?.pm2?.map((app) => (
                    <tr key={app.name} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-200">{app.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          app.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-zinc-400">{app.cpu}%</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-zinc-400">{formatBytes(app.memory)}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-zinc-400">{app.restarts}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-zinc-400">{formatUptime(Math.floor(app.uptime / 1000))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Usage & Costs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-800/50 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="font-bold text-sm uppercase tracking-widest text-zinc-400">Brain Resource Allocation</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                    <th className="px-6 py-4 font-semibold">Agent</th>
                    <th className="px-6 py-4 font-semibold">Model</th>
                    <th className="px-6 py-4 font-semibold text-right">Total Tokens</th>
                    <th className="px-6 py-4 font-semibold text-right">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {usageStats.map((u) => (
                    <tr key={`${u.agent}-${u.model}`} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-200 uppercase">{u.agent}</td>
                      <td className="px-6 py-4 text-zinc-400">{u.model}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-zinc-400">{u.total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-green-500">
                        ${((u.total / 1000000) * 0.10).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500">
          No system telemetry available.
        </div>
      )}
    </div>
  )
}
