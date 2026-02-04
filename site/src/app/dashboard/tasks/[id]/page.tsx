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
  created_at: string;
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
  const notesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (notesContainerRef.current) {
      notesContainerRef.current.scrollTop = notesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [notes]);

  useEffect(() => {
    fetchTask();
    fetchNotes();
    fetchLogs();

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
    const { data } = await supabase.from('activity_logs').select('*').eq('task_id', id).order('created_at', { ascending: false });
    setLogs(data || []);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    await supabase.from('task_notes').insert({ task_id: id, author: 'pj', content: newNote });
    setNewNote('');
  }

  async function updateStatus(status: string) {
    await supabase.from('tasks').update({ status }).eq('id', id);
    fetchTask();
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: '#fff' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ padding: '2rem', color: '#fff' }}>
        <p>Task not found</p>
        <Link href="/dashboard/tasks" style={{ color: '#E31837' }}>← Back to Tasks</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: '#6b7280',
    in_progress: '#f59e0b',
    completed: '#10b981',
  };

  return (
    <div style={{ padding: '2rem', color: '#fff', maxWidth: '800px' }}>
      {/* Back link */}
      <Link href="/dashboard/tasks" style={{ color: '#E31837', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Tasks
      </Link>

      {/* Task Header */}
      <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #333' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{task.title}</h1>
          <span style={{ 
            background: statusColors[task.status] || '#6b7280', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '999px', 
            fontSize: '0.75rem',
            textTransform: 'uppercase'
          }}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
        
        <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>{task.description}</p>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#333', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
            Priority: {task.priority}
          </span>
          <span style={{ background: '#333', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
            Created: {new Date(task.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Status buttons */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => updateStatus('pending')}
            style={{ 
              padding: '0.5rem 1rem', 
              background: task.status === 'pending' ? '#6b7280' : 'transparent',
              border: '1px solid #6b7280',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Pending
          </button>
          <button 
            onClick={() => updateStatus('in_progress')}
            style={{ 
              padding: '0.5rem 1rem', 
              background: task.status === 'in_progress' ? '#f59e0b' : 'transparent',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            In Progress
          </button>
          <button 
            onClick={() => updateStatus('completed')}
            style={{ 
              padding: '0.5rem 1rem', 
              background: task.status === 'completed' ? '#10b981' : 'transparent',
              border: '1px solid #10b981',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Activity Log */}
      <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #333' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>📋 Activity Log</h2>
        
        {logs.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No activity logged yet for this task.</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {logs.map((log) => (
              <div key={log.id} style={{ 
                display: 'flex', 
                gap: '1rem', 
                padding: '0.75rem 0',
                borderBottom: '1px solid #2a2a2a'
              }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280',
                  minWidth: '80px',
                  whiteSpace: 'nowrap'
                }}>
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ 
                      background: log.agent === 'chase' ? '#E31837' : log.agent === 'pj' ? '#3b82f6' : '#6b7280',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase'
                    }}>
                      {log.agent}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>{log.action}</span>
                  </div>
                  {log.details && (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>{log.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discussion Thread */}
      <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '1.5rem', border: '1px solid #333' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>💬 Discussion</h2>
        
        {/* Notes list */}
        <div ref={notesContainerRef} style={{ marginBottom: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
          {notes.length === 0 ? (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No notes yet. Start the conversation!</p>
          ) : (
            <>
              {notes.map((note) => (
                <div key={note.id} style={{ 
                  background: note.author === 'chase' ? '#1e3a5f' : '#2d2d2d', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '8px', 
                  marginBottom: '0.5rem',
                  borderLeft: `3px solid ${note.author === 'chase' ? '#3b82f6' : '#E31837'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ color: note.author === 'chase' ? '#60a5fa' : '#E31837' }}>
                      {note.author === 'chase' ? '⚡ Chase' : '👤 ' + note.author}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{note.content}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Add note form */}
        <form onSubmit={addNote} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#E31837',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Send
          </button>
        </form>
      </div>

      {/* Real-time indicator */}
      <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
        🟢 Real-time sync enabled
      </p>
    </div>
  );
}
