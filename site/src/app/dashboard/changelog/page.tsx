'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, ChangelogEntry } from '@/lib/supabase'

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()

    const channel = supabase
      .channel('changelog-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'changelog' }, () => {
        fetchEntries()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchEntries() {
    try {
      const { data, error } = await supabase
        .from('changelog')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching changelog:', error)
    } finally {
      setLoading(false)
    }
  }

  const categoryColors = {
    feature: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    fix: 'bg-red-500/10 text-red-500 border-red-500/20',
    improvement: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  }

  const categoryIcons = {
    feature: '✨',
    fix: '🐛',
    improvement: '📈',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Changelog</h1>
        <p className="text-zinc-500 mt-1">Updates and improvements to the LoCo OS platform.</p>
      </div>

      {entries.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500">No changelog entries found.</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-800 bg-black text-xs font-bold z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {categoryIcons[entry.category]}
              </div>

              {/* Content */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${categoryColors[entry.category]}`}>
                      {entry.category}
                    </span>
                    {entry.version && (
                      <span className="text-xs font-mono text-zinc-500">v{entry.version}</span>
                    )}
                  </div>
                  <time className="text-xs text-zinc-500 font-mono">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </time>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{entry.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
