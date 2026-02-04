'use client'

import { useEffect, useState, use, useRef } from 'react'
import Link from 'next/link'
import { supabase, Project, Task, ProjectNote, TimeEntry, Invoice, Expense, ActivityLog } from '@/lib/supabase'

interface ProjectWithStats extends Project {
  tasks: Task[]
  notes: ProjectNote[]
  timeEntries: TimeEntry[]
  expenses: Expense[]
  invoices: Invoice[]
  logs: ActivityLog[]
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<ProjectWithStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tasks' | 'time' | 'money' | 'notes' | 'activity'>('tasks')
  
  // Notes
  const [newNote, setNewNote] = useState('')
  const notesContainerRef = useRef<HTMLDivElement>(null)
  
  // Time entry
  const [showTimeForm, setShowTimeForm] = useState(false)
  const [newTimeEntry, setNewTimeEntry] = useState({ description: '', hours: '', minutes: '', date: new Date().toISOString().split('T')[0] })
  
  // Task
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '' })

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', client: '', budget: '', start_date: '', end_date: '' })

  const scrollToBottom = () => {
    if (notesContainerRef.current) {
      notesContainerRef.current.scrollTop = notesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [project?.notes])

  useEffect(() => {
    fetchProject()

    // Subscribe to all related changes
    const channels = [
      supabase.channel('project-detail').on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${id}` }, () => fetchProject()),
      supabase.channel('project-tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${id}` }, () => fetchProject()),
      supabase.channel('project-notes').on('postgres_changes', { event: '*', schema: 'public', table: 'project_notes', filter: `project_id=eq.${id}` }, () => fetchProject()),
      supabase.channel('project-time').on('postgres_changes', { event: '*', schema: 'public', table: 'time_entries', filter: `project_id=eq.${id}` }, () => fetchProject()),
      supabase.channel('project-expenses').on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `project_id=eq.${id}` }, () => fetchProject()),
      supabase.channel('project-invoices').on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `project_id=eq.${id}` }, () => fetchProject()),
      supabase.channel('project-logs').on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => fetchProject()),
    ]

    channels.forEach(ch => ch.subscribe())

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch))
    }
  }, [id])

  async function fetchProject() {
    try {
      const [projectRes, tasksRes, notesRes, timeRes, expensesRes, invoicesRes, logsRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false }),
        supabase.from('project_notes').select('*').eq('project_id', id).order('created_at', { ascending: true }),
        supabase.from('time_entries').select('*').eq('project_id', id).order('date', { ascending: false }),
        supabase.from('expenses').select('*').eq('project_id', id).order('date', { ascending: false }),
        supabase.from('invoices').select('*').eq('project_id', id).order('created_at', { ascending: false }),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50),
      ])

      if (projectRes.error || !projectRes.data) {
        setProject(null)
        setLoading(false)
        return
      }

      // Filter logs for this project (through tasks)
      const taskIds = (tasksRes.data || []).map((t: Task) => t.id)
      const projectLogs = (logsRes.data || []).filter((log: ActivityLog) => 
        taskIds.includes(log.task_id || '')
      )

      setProject({
        ...projectRes.data,
        tasks: tasksRes.data || [],
        notes: notesRes.data || [],
        timeEntries: timeRes.data || [],
        expenses: expensesRes.data || [],
        invoices: invoicesRes.data || [],
        logs: projectLogs,
      })

      // Initialize edit form
      setEditForm({
        name: projectRes.data.name || '',
        description: projectRes.data.description || '',
        client: projectRes.data.client || '',
        budget: projectRes.data.budget ? String(projectRes.data.budget / 100) : '',
        start_date: projectRes.data.start_date || '',
        end_date: projectRes.data.end_date || '',
      })
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    if (!newNote.trim()) return

    await supabase.from('project_notes').insert({ project_id: id, author: 'pj', content: newNote })
    setNewNote('')
  }

  async function addTimeEntry(e: React.FormEvent) {
    e.preventDefault()
    const totalMinutes = (parseInt(newTimeEntry.hours) || 0) * 60 + (parseInt(newTimeEntry.minutes) || 0)
    if (totalMinutes <= 0 || !newTimeEntry.description.trim()) return

    await supabase.from('time_entries').insert({
      project_id: id,
      description: newTimeEntry.description,
      minutes: totalMinutes,
      date: newTimeEntry.date,
    })
    setNewTimeEntry({ description: '', hours: '', minutes: '', date: new Date().toISOString().split('T')[0] })
    setShowTimeForm(false)
  }

  async function deleteTimeEntry(entryId: string) {
    await supabase.from('time_entries').delete().eq('id', entryId)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.title.trim()) return

    await supabase.from('tasks').insert({
      project_id: id,
      title: newTask.title,
      description: newTask.description || null,
      status: 'pending',
      priority: 1,
    })
    setNewTask({ title: '', description: '' })
    setShowTaskForm(false)
  }

  async function updateTaskStatus(taskId: string, status: string) {
    await supabase.from('tasks').update({ status }).eq('id', taskId)
  }

  async function updateProject(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('projects').update({
      name: editForm.name,
      description: editForm.description || null,
      client: editForm.client || null,
      budget: editForm.budget ? parseInt(editForm.budget) * 100 : 0,
      start_date: editForm.start_date || null,
      end_date: editForm.end_date || null,
    }).eq('id', id)
    setIsEditing(false)
  }

  async function updateStatus(status: string) {
    await supabase.from('projects').update({ status }).eq('id', id)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-zinc-400 text-lg mb-4">Project not found</p>
        <Link href="/dashboard/projects" className="text-red-500 hover:text-red-400">
          ← Back to Projects
        </Link>
      </div>
    )
  }

  const totalTime = project.timeEntries.reduce((sum, t) => sum + t.minutes, 0)
  const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalInvoiced = project.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const completedTasks = project.tasks.filter(t => t.status === 'completed').length
  const progressPercent = project.tasks.length > 0 ? Math.round((completedTasks / project.tasks.length) * 100) : 0

  const statusColors: Record<string, string> = {
    active: 'bg-green-600/20 text-green-400 border-green-600/30',
    completed: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    archived: 'bg-zinc-600/20 text-zinc-400 border-zinc-600/30',
  }

  const taskStatusColors: Record<string, string> = {
    pending: 'border-zinc-600',
    in_progress: 'border-yellow-500 bg-yellow-500/20',
    completed: 'border-green-500 bg-green-500',
  }

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: '📋', count: project.tasks.length },
    { id: 'time', label: 'Time', icon: '⏱️', count: project.timeEntries.length },
    { id: 'money', label: 'Money', icon: '💰', count: project.expenses.length + project.invoices.length },
    { id: 'notes', label: 'Notes', icon: '💬', count: project.notes.length },
    { id: 'activity', label: 'Activity', icon: '📜', count: project.logs.length },
  ] as const

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors">
        <span>←</span>
        <span>Back to Projects</span>
      </Link>

      {/* Project Header */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        {isEditing ? (
          <form onSubmit={updateProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Client</label>
                <input
                  type="text"
                  value={editForm.client}
                  onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Budget ($)</label>
                <input
                  type="number"
                  value={editForm.budget}
                  onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={editForm.start_date}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">End Date</label>
                  <input
                    type="date"
                    value={editForm.end_date}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Save Changes
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-zinc-400">{project.description || 'No description'}</p>
                {project.client && (
                  <p className="text-sm text-zinc-500 mt-2">
                    <span className="text-zinc-600">Client:</span> {project.client}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                ✏️ Edit
              </button>
            </div>

            {/* Status buttons */}
            <div className="flex gap-2 mb-4">
              {(['active', 'completed', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    project.status === status
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Progress bar */}
            {project.tasks.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span>Progress</span>
                  <span>{completedTasks}/{project.tasks.length} tasks ({progressPercent}%)</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Tasks</p>
                <p className="text-xl font-bold">{project.tasks.length}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Time Logged</p>
                <p className="text-xl font-bold text-blue-400">{formatTime(totalTime)}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Budget</p>
                <p className="text-xl font-bold text-green-400">{project.budget ? formatCurrency(project.budget) : '—'}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Expenses</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Invoiced (Paid)</p>
                <p className="text-xl font-bold text-purple-400">{formatCurrency(totalInvoiced)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="text-xs opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">📋 Tasks</h2>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {showTaskForm ? 'Cancel' : '+ Add Task'}
              </button>
            </div>

            {showTaskForm && (
              <form onSubmit={addTask} className="p-4 border-b border-zinc-800 space-y-3">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  required
                />
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none"
                />
                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  Create Task
                </button>
              </form>
            )}

            <div className="divide-y divide-zinc-800">
              {project.tasks.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <p className="text-4xl mb-2">📋</p>
                  <p>No tasks yet. Create your first task above!</p>
                </div>
              ) : (
                project.tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-zinc-800/30 transition-colors flex items-center gap-4">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className={`appearance-none w-8 h-8 rounded-full border-2 cursor-pointer ${taskStatusColors[task.status]} focus:outline-none`}
                    >
                      <option value="pending">⏳</option>
                      <option value="in_progress">🔄</option>
                      <option value="completed">✓</option>
                    </select>
                    <Link href={`/dashboard/tasks/${task.id}`} className="flex-1 hover:opacity-80">
                      <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-zinc-500' : ''}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-zinc-500">{task.description || 'No description'}</p>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TIME TAB */}
        {activeTab === 'time' && (
          <div>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">⏱️ Time Tracking</h2>
                <p className="text-sm text-zinc-500">Total: {formatTime(totalTime)}</p>
              </div>
              <button
                onClick={() => setShowTimeForm(!showTimeForm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {showTimeForm ? 'Cancel' : '+ Log Time'}
              </button>
            </div>

            {showTimeForm && (
              <form onSubmit={addTimeEntry} className="p-4 border-b border-zinc-800 space-y-3">
                <input
                  type="text"
                  value={newTimeEntry.description}
                  onChange={(e) => setNewTimeEntry({ ...newTimeEntry, description: e.target.value })}
                  placeholder="What did you work on?"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  required
                />
                <div className="flex gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Hours</label>
                    <input
                      type="number"
                      value={newTimeEntry.hours}
                      onChange={(e) => setNewTimeEntry({ ...newTimeEntry, hours: e.target.value })}
                      placeholder="0"
                      min="0"
                      className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Minutes</label>
                    <input
                      type="number"
                      value={newTimeEntry.minutes}
                      onChange={(e) => setNewTimeEntry({ ...newTimeEntry, minutes: e.target.value })}
                      placeholder="0"
                      min="0"
                      max="59"
                      className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={newTimeEntry.date}
                      onChange={(e) => setNewTimeEntry({ ...newTimeEntry, date: e.target.value })}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  Log Time
                </button>
              </form>
            )}

            <div className="divide-y divide-zinc-800">
              {project.timeEntries.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <p className="text-4xl mb-2">⏱️</p>
                  <p>No time logged yet</p>
                </div>
              ) : (
                project.timeEntries.map((entry) => (
                  <div key={entry.id} className="p-4 hover:bg-zinc-800/30 transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-medium">{entry.description}</p>
                      <p className="text-sm text-zinc-500">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-blue-400">{formatTime(entry.minutes)}</span>
                      <button
                        onClick={() => deleteTimeEntry(entry.id)}
                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MONEY TAB */}
        {activeTab === 'money' && (
          <div>
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold">💰 Money Tracking</h2>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500">Budget</p>
                  <p className="text-xl font-bold text-green-400">{project.budget ? formatCurrency(project.budget) : '—'}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500">Expenses</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500">Remaining</p>
                  <p className={`text-xl font-bold ${(project.budget || 0) - totalExpenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {project.budget ? formatCurrency((project.budget || 0) - totalExpenses) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-semibold text-zinc-400 mb-3">Expenses ({project.expenses.length})</h3>
              {project.expenses.length === 0 ? (
                <p className="text-zinc-500 text-sm">No expenses linked to this project</p>
              ) : (
                <div className="space-y-2">
                  {project.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between bg-zinc-800 rounded-lg p-3">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-zinc-500">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-red-400 font-semibold">{formatCurrency(expense.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoices */}
            <div className="p-4">
              <h3 className="font-semibold text-zinc-400 mb-3">Invoices ({project.invoices.length})</h3>
              {project.invoices.length === 0 ? (
                <p className="text-zinc-500 text-sm">No invoices linked to this project</p>
              ) : (
                <div className="space-y-2">
                  {project.invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/dashboard/invoices`}
                      className="flex items-center justify-between bg-zinc-800 rounded-lg p-3 hover:bg-zinc-700 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{invoice.client_name}</p>
                        <p className="text-sm text-zinc-500">{invoice.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 font-semibold">{formatCurrency(invoice.amount)}</span>
                        <p className={`text-xs ${invoice.status === 'paid' ? 'text-green-400' : invoice.status === 'sent' ? 'text-yellow-400' : 'text-zinc-500'}`}>
                          {invoice.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="flex flex-col h-[500px]">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold">💬 Project Notes</h2>
            </div>
            
            <div ref={notesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {project.notes.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">No notes yet. Start the conversation!</p>
              ) : (
                project.notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg ${
                      note.author === 'chase' ? 'bg-blue-900/30 border-l-4 border-blue-500' : 'bg-zinc-800 border-l-4 border-red-500'
                    }`}
                  >
                    <div className="flex justify-between mb-1">
                      <strong className={note.author === 'chase' ? 'text-blue-400' : 'text-red-400'}>
                        {note.author === 'chase' ? '⚡ Chase' : '👤 ' + note.author}
                      </strong>
                      <span className="text-xs text-zinc-500">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={addNote} className="p-4 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
              <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                Send
              </button>
            </form>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div>
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold">📜 Activity Log</h2>
            </div>
            
            <div className="divide-y divide-zinc-800 max-h-[500px] overflow-y-auto">
              {project.logs.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <p className="text-4xl mb-2">📜</p>
                  <p>No activity logged yet for this project&apos;s tasks</p>
                </div>
              ) : (
                project.logs.map((log) => (
                  <div key={log.id} className="p-4 flex gap-4">
                    <div className="text-xs text-zinc-600 min-w-[60px]">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          log.agent === 'chase' ? 'bg-red-600/30 text-red-400' : 'bg-blue-600/30 text-blue-400'
                        }`}>
                          {log.agent}
                        </span>
                        <span className="font-medium">{log.action}</span>
                      </div>
                      {log.details && <p className="text-sm text-zinc-400">{log.details}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Real-time sync enabled</span>
      </div>
    </div>
  )
}
