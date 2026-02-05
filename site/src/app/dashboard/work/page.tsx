'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  project_type: string
  budget: string
  status: 'new' | 'contacted' | 'negotiating' | 'won' | 'lost'
  description: string
  notes: string
  created_at: string
}

export default function WorkManagement() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchLeads()

    const leadsSub = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads()
      })
      .subscribe()

    return () => {
      leadsSub.unsubscribe()
    }
  }, [])

  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (err) {
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateLeadStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(l => l.status === filter)

  const stats = {
    new: leads.filter(l => l.status === 'new').length,
    active: leads.filter(l => ['contacted', 'negotiating'].includes(l.status)).length,
    won: leads.filter(l => l.status === 'won').length
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Found Work</h1>
          <p className="text-zinc-500 mt-1">Manage leads, opportunities, and client outreach</p>
        </div>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all flex items-center gap-2">
          <span>+</span> New Lead
        </button>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs font-mono text-zinc-500 uppercase">New Leads</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.new}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs font-mono text-zinc-500 uppercase">In Progress</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">{stats.active}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs font-mono text-zinc-500 uppercase">Won</p>
          <p className="text-2xl font-bold text-green-500 mt-1">{stats.won}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-px">
        {['all', 'new', 'contacted', 'negotiating', 'won', 'lost'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium transition-all border-b-2 capitalize ${
              filter === f ? 'border-red-600 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Leads Table/Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredLeads.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-500 italic">No leads found in this category.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <motion.div
              layout
              key={lead.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold">{lead.company || lead.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      lead.status === 'won' ? 'bg-green-500/20 text-green-500' :
                      lead.status === 'lost' ? 'bg-zinc-500/20 text-zinc-500' :
                      lead.status === 'new' ? 'bg-red-500/20 text-red-500' :
                      'bg-orange-500/20 text-orange-500'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-zinc-400">
                      <p className="text-[10px] uppercase font-mono text-zinc-600">Contact</p>
                      <p>{lead.name}</p>
                      <p className="text-xs opacity-60">{lead.email || lead.phone || 'No contact info'}</p>
                    </div>
                    <div className="text-zinc-400">
                      <p className="text-[10px] uppercase font-mono text-zinc-600">Project / Budget</p>
                      <p>{lead.project_type || 'Unspecified'}</p>
                      <p className="text-xs opacity-60">{lead.budget || 'N/A'}</p>
                    </div>
                    <div className="text-zinc-400">
                      <p className="text-[10px] uppercase font-mono text-zinc-600">Created</p>
                      <p>{new Date(lead.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {lead.description && (
                    <p className="text-sm text-zinc-500 line-clamp-2 italic">"{lead.description}"</p>
                  )}
                </div>

                <div className="flex flex-row lg:flex-col gap-2 justify-end">
                  <select 
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded px-3 py-2 outline-none"
                  >
                    <option value="new">Mark New</option>
                    <option value="contacted">Mark Contacted</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="won">Won Project</option>
                    <option value="lost">Lost Lead</option>
                  </select>
                  <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-bold transition-all">
                    Open Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Leads database connected via Realtime</span>
      </div>
    </div>
  )
}
