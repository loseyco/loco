'use client';

import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  is_special: boolean;
  created_at: string;
  completed_at: string | null;
}

interface Note {
  id: string;
  task_id: string;
  author: string;
  content: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  agent: string;
  action: string;
  details: string | null;
  task_id: string | null;
  created_at: string;
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [task, setTask] = useState<Task | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const notesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [notes]);

  useEffect(() => {
    fetchTask();
    fetchNotes();
    fetchLogs();

    // Subscribe to task changes
    const taskChannel = supabase
      .channel('task-detail')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `id=eq.${id}` }, () => {
        fetchTask();
      })
      .subscribe();

    // Subscribe to notes changes
    const notesChannel = supabase
      .channel('task-notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_notes', filter: `task_id=eq.${id}` }, () => {
        fetchNotes();
      })
      .subscribe();

    // Subscribe to activity logs changes
    const logsChannel = supabase
      .channel('task-logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs', filter: `task_id=eq.${id}` }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(notesChannel);
      supabase.removeChannel(logsChannel);
    };
  }, [id]);

  async function fetchTask() {
    const { data } = await supabase.from('tasks').select('*').eq('id', id).single();
    setTask(data);
    setLoading(false);
  }

  async function fetchNotes() {
    const { data } = await supabase.from('task_notes').select('*').eq('task_id', id).order('created_at', { ascending: true });
    setNotes(data || []);
  }

  async function fetchLogs() {
    const { data } = await supabase.from('activity_logs').select('*').eq('task_id', id).order('created_at', { ascending: false }).limit(50);
    setLogs(data || []);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    await supabase.from('task_notes').insert({ task_id: id, author: 'pj', content: newNote });
    setNewNote('');
  }

  async function handleAction(action: string) {
    setActionPending(action);
    try {
      switch (action) {
        case 'pause':
          await supabase.from('tasks').update({ status: 'pending' }).eq('id', id);
          break;
        case 'do_now':
          await supabase.from('tasks').update({ status: 'in_progress', priority: 2 }).eq('id', id);
          break;
        case 'complete':
          await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id);
          break;
        case 'reopen':
          await supabase.from('tasks').update({ status: 'pending', completed_at: null }).eq('id', id);
          break;
      }
      await fetchTask();
    } finally {
      setActionPending(null);
    }
  }

  async function updatePriority(newPriority: number) {
    const priority = Math.max(0, Math.min(2, newPriority));
    await supabase.from('tasks').update({ priority }).eq('id', id);
    fetchTask();
  }

  async function toggleSpecial() {
    if (!task) return;
    await supabase.from('tasks').update({ is_special: !task.is_special }).eq('id', id);
    fetchTask();
  }

  function getAgentColor(agent: string): string {
    if (agent.toLowerCase() === 'chase') {
      return 'bg-red-600/20 text-red-400 border-red-600/30';
    }
    const colors = [
      'bg-purple-600/20 text-purple-400 border-purple-600/30',
      'bg-blue-600/20 text-blue-400 border-blue-600/30',
      'bg-cyan-600/20 text-cyan-400 border-cyan-600/30',
      'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
      'bg-amber-600/20 text-amber-400 border-amber-600/30',
    ];
    const hash = agent.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  function getActionIcon(action: string): string {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('create') || lowerAction.includes('add')) return '➕';
    if (lowerAction.includes('update') || lowerAction.includes('edit')) return '✏️';
    if (lowerAction.includes('delete') || lowerAction.includes('remove')) return '🗑️';
    if (lowerAction.includes('complete') || lowerAction.includes('finish')) return '✅';
    if (lowerAction.includes('start') || lowerAction.includes('begin')) return '🚀';
    if (lowerAction.includes('spawn') || lowerAction.includes('sub-agent')) return '🤖';
    return '📝';
  }

  function formatTime(timestamp: string) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(timestamp: string) {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatRelativeTime(timestamp: string) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const priorityLabels: Record<number, string> = { 0: 'Low', 1: 'Medium', 2: 'High' };
  const priorityColors: Record<number, string> = {
    0: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    1: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
    2: 'bg-red-600/20 text-red-400 border-red-600/30',
  };

  const statusConfig: Record<string, { color: string; bg: string; border: string; icon: string }> = {
    pending: { color: 'text-zinc-400', bg: 'bg-zinc-600/20', border: 'border-zinc-600/30', icon: '⏳' },
    in_progress: { color: 'text-yellow-400', bg: 'bg-yellow-600/20', border: 'border-yellow-600/30', icon: '🔄' },
    completed: { color: 'text-green-400', bg: 'bg-green-600/20', border: 'border-green-600/30', icon: '✅' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-4">
        <p className="text-zinc-400">Task not found</p>
        <Link href="/dashboard/tasks" className="text-red-500 hover:text-red-400 transition-colors">
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  const status = statusConfig[task.status] || statusConfig.pending;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <Link href="/dashboard/tasks" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
        <span>←</span>
        <span>Back to Tasks</span>
      </Link>

      {/* Action Bar - Premium Floating Style */}
      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 p-4 sticky top-4 z-10 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary Actions */}
          {task.status !== 'completed' ? (
            <>
              <button
                onClick={() => handleAction('do_now')}
                disabled={actionPending !== null}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  task.status === 'in_progress'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                } ${actionPending === 'do_now' ? 'opacity-50 cursor-wait' : ''}`}
              >
                <span>🚀</span>
                <span>{task.status === 'in_progress' ? 'In Progress' : 'Do Now'}</span>
              </button>

              <button
                onClick={() => handleAction('pause')}
                disabled={actionPending !== null || task.status === 'pending'}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  task.status === 'pending'
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30'
                } ${actionPending === 'pause' ? 'opacity-50 cursor-wait' : ''}`}
              >
                <span>⏸️</span>
                <span>Pause</span>
              </button>

              <button
                onClick={() => handleAction('complete')}
                disabled={actionPending !== null}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 ${
                  actionPending === 'complete' ? 'opacity-50 cursor-wait' : ''
                }`}
              >
                <span>✅</span>
                <span>Complete</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction('reopen')}
              disabled={actionPending !== null}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 ${
                actionPending === 'reopen' ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              <span>🔄</span>
              <span>Reopen Task</span>
            </button>
          )}

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-zinc-700" />

          {/* Priority Controls */}
          <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-1">
            <button
              onClick={() => updatePriority(task.priority - 1)}
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
              disabled={task.priority === 0}
            >
              −
            </button>
            <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${priorityColors[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
            <button
              onClick={() => updatePriority(task.priority + 1)}
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
              disabled={task.priority === 2}
            >
              +
            </button>
          </div>

          {/* Special Toggle */}
          <button
            onClick={toggleSpecial}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
              task.is_special
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-zinc-800 text-zinc-500 hover:text-yellow-400 hover:bg-yellow-500/10'
            }`}
            title={task.is_special ? 'Remove from Special' : 'Mark as Special'}
          >
            {task.is_special ? '★' : '☆'}
          </button>
        </div>
      </div>

      {/* Task Header */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {task.status === 'in_progress' && (
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-500/50" />
              )}
              <h1 className={`text-2xl font-bold ${task.status === 'completed' ? 'line-through text-zinc-500' : ''}`}>
                {task.title}
              </h1>
            </div>
            <p className="text-zinc-400">{task.description || 'No description provided.'}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${status.bg} ${status.color} ${status.border}`}>
            {status.icon} {task.status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span>📅</span>
            Created {formatDate(task.created_at)}
          </span>
          {task.completed_at && (
            <span className="flex items-center gap-1.5">
              <span>✅</span>
              Completed {formatDate(task.completed_at)}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Logs */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>📋</span>
              Task Logs
            </h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-6 text-center text-zinc-500">
                <p className="text-3xl mb-2">📝</p>
                <p>No activity logged yet for this task.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {logs.map((log) => (
                  <div key={log.id} className="px-6 py-3 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{getActionIcon(log.action)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getAgentColor(log.agent)}`}>
                            {log.agent}
                          </span>
                          <span className="font-medium text-sm">{log.action}</span>
                        </div>
                        {log.details && (
                          <p className="text-sm text-zinc-400 mt-1 break-words">{log.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-zinc-600 whitespace-nowrap" title={new Date(log.created_at).toLocaleString()}>
                        {formatRelativeTime(log.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Discussion Thread */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>💬</span>
              Discussion
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-zinc-500">Live</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 max-h-[350px] overflow-y-auto p-4 space-y-3">
            {notes.length === 0 ? (
              <div className="text-center text-zinc-500 py-8">
                <p className="text-3xl mb-2">💭</p>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {notes.map((note, index) => {
                  const isChase = note.author.toLowerCase() === 'chase';
                  const showDate = index === 0 || 
                    new Date(note.created_at).toDateString() !== new Date(notes[index - 1].created_at).toDateString();
                  
                  return (
                    <div key={note.id}>
                      {showDate && (
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-zinc-800 px-3 py-1 rounded-full text-xs text-zinc-500">
                            {formatDate(note.created_at)}
                          </div>
                        </div>
                      )}
                      <div className={`flex ${isChase ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                            isChase
                              ? 'bg-zinc-800 rounded-bl-md'
                              : 'bg-red-600/90 rounded-br-md'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold ${isChase ? 'text-blue-400' : 'text-red-200'}`}>
                              {isChase ? '⚡ Chase' : `👤 ${note.author}`}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {formatTime(note.created_at)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={notesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={addNote} className="p-4 border-t border-zinc-800 bg-zinc-900/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="w-10 h-10 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-full transition-colors"
              >
                <span className="text-lg">↑</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Real-time sync enabled — updates appear instantly</span>
      </div>
    </div>
  );
}
