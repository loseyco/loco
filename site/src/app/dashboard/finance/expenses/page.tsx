'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase, Expense, ExpenseCategory } from '@/lib/supabase'

const DEFAULT_CATEGORIES: Partial<ExpenseCategory>[] = [
  { name: 'Software', icon: '💻', color: '#3B82F6' },
  { name: 'Hardware', icon: '🖥️', color: '#10B981' },
  { name: 'Travel', icon: '✈️', color: '#F59E0B' },
  { name: 'Office', icon: '📎', color: '#8B5CF6' },
  { name: 'Marketing', icon: '📢', color: '#EC4899' },
  { name: 'Professional Services', icon: '👔', color: '#6366F1' },
  { name: 'Utilities', icon: '⚡', color: '#14B8A6' },
  { name: 'Other', icon: '📦', color: '#6B7280' },
]

function ExpensesContent() {
  const searchParams = useSearchParams()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(searchParams.get('add') === 'true')
  
  // Filter state
  const [filterCategory, setFilterCategory] = useState('')
  const [filterDeductible, setFilterDeductible] = useState<'' | 'true' | 'false'>('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    is_deductible: true,
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      // Fetch categories
      const { data: catData } = await supabase.from('expense_categories').select('*')
      if (catData && catData.length > 0) {
        setCategories(catData)
      } else {
        // Insert default categories if none exist
        const { data: insertedCats } = await supabase
          .from('expense_categories')
          .insert(DEFAULT_CATEGORIES)
          .select()
        setCategories(insertedCats || [])
      }

      // Build query with filters
      let query = supabase
        .from('expenses')
        .select('*, category:expense_categories(*)')
        .order('date', { ascending: false })

      if (filterCategory) {
        query = query.eq('category_id', filterCategory)
      }
      if (filterDeductible) {
        query = query.eq('is_deductible', filterDeductible === 'true')
      }
      if (filterDateFrom) {
        query = query.gte('date', filterDateFrom)
      }
      if (filterDateTo) {
        query = query.lte('date', filterDateTo)
      }

      const { data: expData } = await query
      setExpenses(expData || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }, [filterCategory, filterDeductible, filterDateFrom, filterDateTo])

  useEffect(() => {
    fetchData()

    const sub = supabase
      .channel('expenses-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchData())
      .subscribe()

    return () => {
      sub.unsubscribe()
    }
  }, [fetchData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase.from('expenses').insert({
        description: formData.description,
        amount: Math.round(parseFloat(formData.amount) * 100), // Store in cents
        category_id: formData.category_id || null,
        vendor: formData.vendor || null,
        date: formData.date,
        notes: formData.notes || null,
        is_deductible: formData.is_deductible,
      })

      if (error) throw error

      // Reset form
      setFormData({
        description: '',
        amount: '',
        category_id: '',
        vendor: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        is_deductible: true,
      })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding expense:', error)
      alert('Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteExpense(id: string) {
    if (!confirm('Delete this expense?')) return
    try {
      await supabase.from('expenses').delete().eq('id', id)
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  const totalFiltered = expenses.reduce((sum, e) => sum + e.amount, 0)
  const deductibleTotal = expenses.filter(e => e.is_deductible).reduce((sum, e) => sum + e.amount, 0)

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
            <span className="text-white">Expenses</span>
          </div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-zinc-500 mt-1">Track and categorize business expenses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          <span className="text-xl">+</span>
          <span>Add Expense</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <p className="text-zinc-400 text-sm">Showing</p>
          <p className="text-2xl font-bold text-white mt-1">{expenses.length} expenses</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <p className="text-zinc-400 text-sm">Total (Filtered)</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalFiltered)}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <p className="text-zinc-400 text-sm">Deductible</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{formatCurrency(deductibleTotal)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <h3 className="font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Deductible</label>
            <select
              value={filterDeductible}
              onChange={(e) => setFilterDeductible(e.target.value as '' | 'true' | 'false')}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="true">Deductible Only</option>
              <option value="false">Non-Deductible</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">From Date</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">To Date</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        {(filterCategory || filterDeductible || filterDateFrom || filterDateTo) && (
          <button
            onClick={() => {
              setFilterCategory('')
              setFilterDeductible('')
              setFilterDateFrom('')
              setFilterDateTo('')
            }}
            className="mt-4 text-sm text-red-500 hover:text-red-400"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Expenses List */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <p className="text-4xl mb-4">💳</p>
            <p className="text-lg font-medium">No expenses found</p>
            <p className="text-sm mt-1">Add your first expense to start tracking</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50 text-left text-sm text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Vendor</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Deductible</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{expense.description}</p>
                      {expense.notes && (
                        <p className="text-sm text-zinc-500 truncate max-w-xs">{expense.notes}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {expense.category ? (
                        <span className="flex items-center gap-2">
                          <span>{expense.category.icon}</span>
                          <span className="text-zinc-300">{expense.category.name}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{expense.vendor || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-red-400">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4">
                      {expense.is_deductible ? (
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs">
                          ✓ Deductible
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-sm">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteExpense(expense.id)}
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
        <span>Expenses sync in real-time</span>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Add Expense</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="What did you spend on?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
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
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Vendor</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Company or person"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Additional details..."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_deductible: !formData.is_deductible })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    formData.is_deductible ? 'bg-purple-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                      formData.is_deductible ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <label className="text-sm text-zinc-300">Tax Deductible</label>
              </div>
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
                  {submitting ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ExpensesContent />
    </Suspense>
  )
}
