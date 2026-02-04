'use client'

import { useEffect, useState } from 'react'
import { supabase, Project } from '@/lib/supabase'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [newProjectName, setNewProjectName] = useState('')

  useEffect(() => {
    fetchProjects()

    // Real-time subscription
    const subscription = supabase
      .channel('projects-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          console.log('Project change:', payload)
          if (payload.eventType === 'INSERT') {
            setProjects((prev) => [payload.new as Project, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setProjects((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as Project) : p))
            )
          } else if (payload.eventType === 'DELETE') {
            setProjects((prev) => prev.filter((p) => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newProjectName.trim()) return

    try {
      const { error } = await supabase.from('projects').insert({
        name: newProjectName,
        status: 'active',
      })
      if (error) throw error
      setNewProjectName('')
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  async function deleteProject(id: string) {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  async function toggleStatus(project: Project) {
    const newStatus = project.status === 'active' ? 'completed' : 'active'
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', project.id)
      if (error) throw error
    } catch (error) {
      console.error('Error updating project:', error)
    }
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
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-zinc-500 mt-1">Manage your projects with real-time updates</p>
      </div>

      {/* Create Project Form */}
      <form onSubmit={createProject} className="flex gap-4">
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New project name..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          Create Project
        </button>
      </form>

      {/* Projects List */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="divide-y divide-zinc-800">
          {projects.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p className="text-4xl mb-4">📁</p>
              <p>No projects yet. Create your first one above!</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="p-4 hover:bg-zinc-800/30 transition-colors flex items-center gap-4"
              >
                {/* Status toggle */}
                <button
                  onClick={() => toggleStatus(project)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    project.status === 'completed'
                      ? 'bg-green-600 border-green-600'
                      : 'border-zinc-600 hover:border-red-500'
                  }`}
                >
                  {project.status === 'completed' && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </button>

                {/* Project info */}
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      project.status === 'completed' ? 'line-through text-zinc-500' : ''
                    }`}
                  >
                    {project.name}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {project.description || 'No description'} •{' '}
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Status badge */}
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

                {/* Delete button */}
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
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
