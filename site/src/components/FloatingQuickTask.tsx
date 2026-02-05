'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function FloatingQuickTask() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title) return

    setLoading(true)
    try {
      const { error } = await supabase.from('tasks').insert({
        title,
        description: `${description}\n\n[Auto-logged from: ${pathname}]`,
        status: 'pending',
        priority: 1,
        is_special: false
      })

      if (error) throw error
      
      setTitle('')
      setDescription('')
      setIsOpen(false)
      alert('Task added successfully! 🚀')
    } catch (err: any) {
      alert('Failed to add task: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-800 bg-red-600/10 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-widest text-red-500 flex items-center gap-2">
                <span>💡</span> Quick Wish
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Feature / Task Name</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="I wish htis page had..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Details (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the improvement..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 outline-none transition-all resize-none placeholder:text-zinc-600"
                />
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
              >
                {loading ? 'Adding...' : (
                  <>
                    <span>+</span> Add Task
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all ${
          isOpen ? 'bg-zinc-800 text-white rotate-90' : 'bg-red-600 text-white hover:bg-red-500'
        }`}
      >
        {isOpen ? '✕' : '💡'}
      </motion.button>
    </div>
  )
}
