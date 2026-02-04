'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase, MemoryEntry } from '@/lib/supabase'

interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'agent'
  created_at: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()

    // Real-time subscription for memory entries (used as chat log)
    const subscription = supabase
      .channel('chat-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'memory_entries' },
        (payload) => {
          const entry = payload.new as MemoryEntry
          if (entry.type === 'chat') {
            const msg: ChatMessage = {
              id: entry.id,
              content: entry.content,
              type: entry.content.startsWith('[USER]') ? 'user' : 'agent',
              created_at: entry.created_at,
            }
            setMessages((prev) => [...prev, msg])
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('memory_entries')
        .select('*')
        .eq('type', 'chat')
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error

      const chatMessages: ChatMessage[] = (data || []).map((entry: MemoryEntry) => ({
        id: entry.id,
        content: entry.content.replace(/^\[(USER|AGENT)\]\s*/, ''),
        type: entry.content.startsWith('[USER]') ? 'user' : 'agent',
        created_at: entry.created_at,
      }))

      setMessages(chatMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const messageContent = input.trim()
    setInput('')

    // Optimistically add to UI
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      type: 'user',
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])

    try {
      // Store in memory_entries
      const { error } = await supabase.from('memory_entries').insert({
        content: `[USER] ${messageContent}`,
        type: 'chat',
      })
      if (error) throw error
    } catch (error) {
      console.error('Error sending message:', error)
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-zinc-500 mt-1">Real-time messaging interface</p>
      </div>

      {/* Messages container */}
      <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500">
              <div className="text-center">
                <p className="text-4xl mb-4">💬</p>
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.type === 'user'
                      ? 'bg-red-600 text-white rounded-br-md'
                      : 'bg-zinc-800 text-zinc-100 rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-red-200' : 'text-zinc-500'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={sendMessage} className="p-4 border-t border-zinc-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mt-4">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Messages sync in real-time</span>
      </div>
    </div>
  )
}
