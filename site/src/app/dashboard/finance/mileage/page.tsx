'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase, MileageLog } from '@/lib/supabase'

const IRS_RATE_2024 = 0.67 // $0.67 per mile

export default function MileagePage() {
  const [entries, setEntries] = useState<MileageLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    miles: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Date filters
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [filterMonth, setFilterMonth] = useState('')

  const fetchData = useCallback(async () => {
    try {
      let query = supabase
        .from('mileage_log')
        .select('*')
        .order('date', { ascending: false })

      if (filterYear) {
        query = query.gte('date', `${filterYear}-01-01`).lte('date', `${filterYear}-12-31`)
      }
      if (filterMonth) {
        const monthNum = filterMonth.padStart(2, '0')
        query = query.gte('date', `${filterYear}-${monthNum}-01`).lte('date', `${filterYear}-${monthNum}-31`)
      }

      const { data } = await query
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching mileage:', error)
    } finally {
      setLoading(false)
    }
  }, [filterYear, filterMonth])

  useEffect(() => {
    fetchData()

    const sub = supabase
      .channel('mileage-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mileage_log' }, () => fetchData())
      .subscribe()

    return () => {
      sub.unsubscribe()
    }
  }, [fetchData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase.from('mileage_log').insert({
        date: formData.date,
        description: formData.description,
        miles: parseFloat(formData.miles),
        deduction_rate: IRS_RATE_2024,
      })

      if (error) throw error

      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        miles: '',
      })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding mileage:', error)
      alert('Failed to add mileage entry')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm('Delete this mileage entry?')) return
    try {
      await supabase.from('mileage_log').delete().eq('id', id)
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const totalMiles = entries.reduce((sum, e) => sum + e.miles, 0)
  const totalDeduction = entries.reduce((sum, e) => sum + (e.miles * e.deduction_rate), 0)

  // Group by month
  const monthlyStats = entries.reduce((acc, entry) => {
    const month = entry.date.substring(0, 7) // YYYY-MM
    if (!acc[month]) {
      acc[month] = { miles: 0, deduction: 0 }
    }
    acc[month].miles += entry.miles
    acc[month].deduction += entry.miles * entry.deduction_rate
    return acc
  }, {} as Record<string, { miles: number; deduction: number }>)

  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())

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
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
            <Link href="/dashboard/finance" className="hover:text-red-400">Finance</Link>
            <span>/</span>
            <span className="text-white">Mileage</span>
          </div>
          <h1 className="text-3xl font-bold">Mileage Log</h1>
          <p className="text-zinc-500 mt-1">Track vehicle miles for tax deductions (2024 IRS rate: $0.67/mile)</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          <span className="text-xl">+</span>
          <span>Log Miles</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Miles</p>
              <p className="text-3xl font-bold text-white mt-1">{totalMiles.toLocaleString()}</p>
            </div>
            <span className="text-4xl opacity-50">🚗</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Tax Deduction</p>
              <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalDeduction)}</p>
            </div>
            <span className="text-4xl opacity-50">🏛️</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Trips Logged</p>
              <p className="text-3xl font-bold text-white mt-1">{entries.length}</p>
            </div>
            <span className="text-4xl opacity-50">📝</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <h3 className="font-semibold mb-4">Filter by Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Month</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      {Object.keys(monthlyStats).length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold">Monthly Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {Object.entries(monthlyStats)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([month, stats]) => {
                const [year, monthNum] = month.split('-')
                const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
                return (
                  <div key={month} className="bg-zinc-800/50 rounded-lg p-4">
                    <p className="text-zinc-400 text-sm">{monthName}</p>
                    <div className="flex items-baseline gap-4 mt-2">
                      <span className="text-xl font-bold text-white">{stats.miles.toLocaleString()} mi</span>
                      <span className="text-purple-400 font-medium">{formatCurrency(stats.deduction)}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Mileage Entries */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">Mileage Entries</h2>
        </div>
        {entries.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <p className="text-4xl mb-4">🚗</p>
            <p className="text-lg font-medium">No mileage entries</p>
            <p className="text-sm mt-1">Start logging your business miles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50 text-left text-sm text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Miles</th>
                  <th className="px-6 py-4 font-medium">Rate</th>
                  <th className="px-6 py-4 font-medium">Deduction</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{entry.description}</td>
                    <td className="px-6 py-4 text-blue-400 font-semibold">
                      {entry.miles.toLocaleString()} mi
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      ${entry.deduction_rate}/mi
                    </td>
                    <td className="px-6 py-4 font-semibold text-purple-400">
                      {formatCurrency(entry.miles * entry.deduction_rate)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Mileage data syncs in real-time</span>
      </div>

      {/* Add Mileage Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Log Mileage</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Client meeting downtown"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Miles *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.miles}
                  onChange={(e) => setFormData({ ...formData, miles: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
              {formData.miles && (
                <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-4">
                  <p className="text-sm text-zinc-400">Estimated Deduction</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {formatCurrency(parseFloat(formData.miles || '0') * IRS_RATE_2024)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">At $0.67/mile (2024 IRS rate)</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                >
                  {submitting ? 'Adding...' : 'Log Mileage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
