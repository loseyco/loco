'use client'

import { useEffect, useState } from 'react'
import { supabase, Project, Task, AgentSession } from '@/lib/supabase'

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

    return () => {
      projectsSub.unsubscribe()
      tasksSub.unsubscribe()
    }
  }, [])

  async function fetchData() {
    try {
      const [projectsRes, tasksRes, sessionsRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('tasks').select('*'),
        supabase.from('agent_sessions').select('*'),
      ])

      const projects = projectsRes.data || []
      const tasks = tasksRes.data || []
      const sessions = sessionsRes.data || []

      setStats({
        totalProjects: projects.length,
        activeTasks: tasks.filter((t: Task) => t.status !== 'completed').length,
        completedTasks: tasks.filter((t: Task) => t.status === 'completed').length,
        agentSessions: sessions.length,
      })
      setRecentProjects(projects.slice(0, 5))
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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Real-time overview of your workspace</p>
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

      {/* Recent Projects */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
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

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Updates appear automatically — no refresh needed</span>
      </div>
    </div>
  )
}
