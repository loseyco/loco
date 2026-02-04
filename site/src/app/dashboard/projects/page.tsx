'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Project, Task } from '@/lib/supabase'

interface ProjectWithStats extends Project {
  taskCount: number
  completedTasks: number
  totalSpent: number
  totalTime: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all')
  
  // Form state
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    client: '',
    budget: '',
  })

  useEffect(() => {
    fetchProjects()

    // Real-time subscription for projects
    const projectsSub = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects()
      })
      .subscribe()

    // Real-time subscription for tasks (affects task counts)
    const tasksSub = supabase
      .channel('projects-tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchProjects()
      })
      .subscribe()

    return () => {
      projectsSub.unsubscribe()
      tasksSub.unsubscribe()
    }
  }, [])

  async function fetchProjects() {
    try {
      const [projectsRes, tasksRes, expensesRes, timeRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('id, project_id, status'),
        supabase.from('expenses').select('id, project_id, amount'),
        supabase.from('time_entries').select('id, project_id, minutes'),
      ])

      const projectsData = projectsRes.data || []
      const tasks = tasksRes.data || []
      const expenses = expensesRes.data || []
      const timeEntries = timeRes.data || []

      const projectsWithStats: ProjectWithStats[] = projectsData.map((project) => {
        const projectTasks = tasks.filter((t: any) => t.project_id === project.id)
        const projectExpenses = expenses.filter((e: any) => e.project_id === project.id)
        const projectTime = timeEntries.filter((t: any) => t.project_id === project.id)

        return {
          ...project,
          taskCount: projectTasks.length,
          completedTasks: projectTasks.filter((t: any) => t.status === 'completed').length,
          totalSpent: projectExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
          totalTime: projectTime.reduce((sum: number, t: any) => sum + (t.minutes || 0), 0),
        }
      })

      setProjects(projectsWithStats)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newProject.name.trim()) return

    try {
      const { error } = await supabase.from('projects').insert({
        name: newProject.name,
        description: newProject.description || null,
        client: newProject.client || null,
        budget: newProject.budget ? parseInt(newProject.budget) * 100 : 0, // Convert to cents
        status: 'active',
      })
      if (error) throw error
      setNewProject({ name: '', description: '', client: '', budget: '' })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  async function deleteProject(id: string) {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  async function toggleStatus(project: ProjectWithStats) {
    const newStatus = project.status === 'active' ? 'completed' : 'active'
    try {
      const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', project.id)
      if (error) throw error
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const filteredProjects = projects.filter((p) => filter === 'all' || p.status === filter)

  const getProgressPercent = (project: ProjectWithStats) => {
    if (project.taskCount === 0) return 0
    return Math.round((project.completedTasks / project.taskCount) * 100)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-zinc-500 mt-1">Manage your projects with real-time updates</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <span className="text-xl">{showCreateForm ? '×' : '+'}</span>
          <span>{showCreateForm ? 'Cancel' : 'New Project'}</span>
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <form onSubmit={createProject} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Project Name *</label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Enter project name"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Client</label>
              <input
                type="text"
                value={newProject.client}
                onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                placeholder="Client name"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Project description"
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Budget ($)</label>
              <input
                type="number"
                value={newProject.budget}
                onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'active', 'completed', 'archived'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-2 text-xs opacity-70">
                ({projects.filter((p) => p.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="grid gap-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
            <p className="text-4xl mb-4">📁</p>
            <p className="text-zinc-400 text-lg">
              {filter === 'all' ? 'No projects yet. Create your first one!' : `No ${filter} projects`}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block bg-zinc-900 rounded-xl border border-zinc-800 hover:border-red-600/30 transition-all duration-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left side - Project info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className={`text-xl font-semibold group-hover:text-red-400 transition-colors ${
                          project.status === 'completed' ? 'line-through text-zinc-500' : ''
                        }`}
                      >
                        {project.name}
                      </h3>
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
                    <p className="text-zinc-500 text-sm mb-3 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                    {project.client && (
                      <p className="text-sm text-zinc-400">
                        <span className="text-zinc-600">Client:</span> {project.client}
                      </p>
                    )}
                  </div>

                  {/* Right side - Stats */}
                  <div className="flex gap-6 text-right shrink-0">
                    <div>
                      <p className="text-2xl font-bold text-white">{project.taskCount}</p>
                      <p className="text-xs text-zinc-500">Tasks</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-400">
                        {project.budget ? formatCurrency(project.budget) : '—'}
                      </p>
                      <p className="text-xs text-zinc-500">Budget</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-400">
                        {project.totalSpent > 0 ? formatCurrency(project.totalSpent) : '—'}
                      </p>
                      <p className="text-xs text-zinc-500">Spent</p>
                    </div>
                  </div>

                  {/* Actions (stop propagation) */}
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        toggleStatus(project)
                      }}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        project.status === 'completed'
                          ? 'bg-green-600 border-green-600'
                          : 'border-zinc-600 hover:border-red-500'
                      }`}
                    >
                      {project.status === 'completed' && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        deleteProject(project.id)
                      }}
                      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {project.taskCount > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {project.completedTasks}/{project.taskCount} tasks ({getProgressPercent(project)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                        style={{ width: `${getProgressPercent(project)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Time tracking */}
                {project.totalTime > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <span className="text-sm text-zinc-500">
                      ⏱️ {formatTime(project.totalTime)} logged
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p className="text-zinc-500 text-sm">Total Projects</p>
          <p className="text-2xl font-bold text-white">{projects.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p className="text-zinc-500 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-400">
            {projects.filter((p) => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p className="text-zinc-500 text-sm">Total Budget</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(projects.reduce((sum, p) => sum + (p.budget || 0), 0))}
          </p>
        </div>
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p className="text-zinc-500 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-red-400">
            {formatCurrency(projects.reduce((sum, p) => sum + p.totalSpent, 0))}
          </p>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Real-time sync enabled — changes appear instantly</span>
      </div>
    </div>
  )
}
