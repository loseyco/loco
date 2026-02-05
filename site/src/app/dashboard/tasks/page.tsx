'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Task } from '@/lib/supabase'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'special'>('all')

  useEffect(() => {
    fetchTasks()

    // Real-time subscription
    const subscription = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task change:', payload)
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [payload.new as Task, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function toggleSpecial(id: string, currentSpecial: boolean) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_special: !currentSpecial })
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error toggling special:', error)
    }
  }

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    try {
      const { error } = await supabase.from('tasks').insert({
        title: newTaskTitle,
        status: 'pending',
        priority: 1, // Changed from 'medium' to integer 1 (low=0, medium=1, high=2)
      })
      if (error) throw error
      setNewTaskTitle('')
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  async function updateTaskStatus(id: string, status: Task['status']) {
    try {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  async function deleteTask(id: string) {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  async function updateTaskPriority(id: string, currentPriority: number, increment: number) {
    try {
      const newPriority = Math.max(0, Math.min(2, currentPriority + increment))
      const { error } = await supabase.from('tasks').update({ priority: newPriority }).eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  async function doNow(id: string) {
    try {
      const { error } = await supabase.from('tasks').update({ 
        priority: 2, 
        status: 'in_progress' 
      }).eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error in doNow:', error)
    }
  }

  async function postpone(id: string) {
    try {
      const { error } = await supabase.from('tasks').update({ 
        priority: 0, 
        status: 'pending' 
      }).eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error in postpone:', error)
    }
  }

  async function stopAllTasks() {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'pending' })
        .eq('status', 'in_progress')
      if (error) throw error
    } catch (error) {
      console.error('Error stopping all tasks:', error)
    }
  }

  const filteredTasks = tasks
    .filter((t) => {
      if (filter === 'all') return true
      if (filter === 'special') return t.is_special
      return t.status === filter
    })
    .sort((a, b) => {
      // First sort by status: in_progress > pending > completed
      const statusOrder = { in_progress: 0, pending: 1, completed: 2 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by priority
      return (b.priority as number) - (a.priority as number);
    })

  const priorityLabels: Record<number, string> = {
    0: 'low',
    1: 'medium', 
    2: 'high',
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-blue-600/20 text-blue-400',
    medium: 'bg-yellow-600/20 text-yellow-400',
    high: 'bg-red-600/20 text-red-400',
  }

  const statusColors = {
    pending: 'border-zinc-600',
    in_progress: 'border-yellow-500 bg-yellow-500/20',
    completed: 'border-green-500 bg-green-500',
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-zinc-500 mt-1">Track and manage your tasks</p>
        </div>
        <button
          onClick={stopAllTasks}
          className="px-4 py-2 bg-zinc-800 hover:bg-red-900/40 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-all"
        >
          🛑 Stop All Tasks
        </button>
      </div>

      {/* Create Task Form */}
      <form onSubmit={createTask} className="flex gap-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          Add Task
        </button>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'in_progress', 'completed', 'special'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="divide-y divide-zinc-800">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p className="text-4xl mb-4">✅</p>
              <p>{filter === 'all' ? 'No tasks yet. Add your first one!' : 'No tasks in this category'}</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-zinc-800/30 transition-colors flex items-center gap-4"
              >
                {/* Status selector */}
                <div className="relative">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                    className={`appearance-none w-8 h-8 rounded-full border-2 cursor-pointer ${statusColors[task.status]} focus:outline-none`}
                  >
                    <option value="pending">⏳</option>
                    <option value="in_progress">🔄</option>
                    <option value="completed">✓</option>
                  </select>
                </div>

                {/* Task info - now clickable */}
                <Link href={`/dashboard/tasks/${task.id}`} className="flex-1 cursor-pointer hover:opacity-80">
                  <div className="flex items-center gap-2">
                    {task.status === 'in_progress' && (
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    )}
                    <h3
                      className={`font-medium ${
                        task.status === 'completed' ? 'line-through text-zinc-500' : ''
                      } ${task.status === 'in_progress' ? 'text-yellow-400' : ''}`}
                    >
                      {task.title}
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-1">
                    {task.description || 'No description'}
                  </p>
                </Link>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mr-4">
                  <button
                    onClick={() => doNow(task.id)}
                    title="Do Now"
                    className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-md transition-colors text-xs border border-green-500/20"
                  >
                    NOW
                  </button>
                  <button
                    onClick={() => postpone(task.id)}
                    title="Postpone"
                    className="p-1.5 text-yellow-500 hover:bg-yellow-500/10 rounded-md transition-colors text-xs border border-yellow-500/20"
                  >
                    LATER
                  </button>
                </div>

                {/* Priority Controls */}
                <div className="flex items-center gap-1 mr-4 bg-zinc-800/50 p-1 rounded-lg">
                  <button 
                    onClick={() => updateTaskPriority(task.id, task.priority as number, -1)}
                    className="px-2 hover:text-white"
                  >-</button>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityColors[priorityLabels[task.priority as number] || 'medium']}`}>
                    {priorityLabels[task.priority as number] || 'medium'}
                  </span>
                  <button 
                    onClick={() => updateTaskPriority(task.id, task.priority as number, 1)}
                    className="px-2 hover:text-white"
                  >+</button>
                </div>

                {/* Special toggle */}
                <button
                  onClick={() => toggleSpecial(task.id, task.is_special)}
                  className={`p-2 transition-colors rounded-lg ${
                    task.is_special ? 'text-yellow-400' : 'text-zinc-600 hover:text-yellow-400'
                  }`}
                  title={task.is_special ? "Remove from Special" : "Mark as Special"}
                >
                  {task.is_special ? '★' : '☆'}
                </button>

                {/* Delete button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p className="text-zinc-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            {tasks.filter((t) => t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p className="text-zinc-500 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-orange-400">
            {tasks.filter((t) => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p className="text-zinc-500 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-400">
            {tasks.filter((t) => t.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Real-time sync enabled</span>
      </div>
    </div>
  )
}
