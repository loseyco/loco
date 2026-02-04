'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Invoice, Expense, MileageLog } from '@/lib/supabase'

interface FinanceStats {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  taxDeductions: number
  mileageDeductions: number
}

interface RecentTransaction {
  id: string
  type: 'income' | 'expense' | 'mileage'
  description: string
  amount: number
  date: string
}

export default function FinancePage() {
  const [stats, setStats] = useState<FinanceStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    taxDeductions: 0,
    mileageDeductions: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()

    // Real-time subscriptions
    const invoicesSub = supabase
      .channel('finance-invoices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => fetchData())
      .subscribe()

    const expensesSub = supabase
      .channel('finance-expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchData())
      .subscribe()

    const mileageSub = supabase
      .channel('finance-mileage')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mileage_log' }, () => fetchData())
      .subscribe()

    return () => {
      invoicesSub.unsubscribe()
      expensesSub.unsubscribe()
      mileageSub.unsubscribe()
    }
  }, [])

  async function fetchData() {
    try {
      const [invoicesRes, expensesRes, mileageRes] = await Promise.all([
        supabase.from('invoices').select('*').eq('status', 'paid'),
        supabase.from('expenses').select('*'),
        supabase.from('mileage_log').select('*'),
      ])

      const invoices: Invoice[] = invoicesRes.data || []
      const expenses: Expense[] = expensesRes.data || []
      const mileage: MileageLog[] = mileageRes.data || []

      const totalIncome = invoices.reduce((sum, inv) => sum + inv.amount, 0)
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
      const deductibleExpenses = expenses.filter(e => e.is_deductible).reduce((sum, exp) => sum + exp.amount, 0)
      const mileageDeductions = mileage.reduce((sum, m) => sum + (m.miles * m.deduction_rate), 0)

      setStats({
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        taxDeductions: deductibleExpenses + mileageDeductions,
        mileageDeductions,
      })

      // Build recent transactions list
      const transactions: RecentTransaction[] = [
        ...invoices.map(inv => ({
          id: inv.id,
          type: 'income' as const,
          description: `${inv.client_name}: ${inv.description}`,
          amount: inv.amount,
          date: inv.created_at,
        })),
        ...expenses.map(exp => ({
          id: exp.id,
          type: 'expense' as const,
          description: exp.description,
          amount: -exp.amount,
          date: exp.date,
        })),
        ...mileage.map(m => ({
          id: m.id,
          type: 'mileage' as const,
          description: `Mileage: ${m.description} (${m.miles} mi)`,
          amount: -(m.miles * m.deduction_rate),
          date: m.date,
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)

      setRecentTransactions(transactions)
    } catch (error) {
      console.error('Error fetching finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  const statCards = [
    { label: 'Total Income', value: stats.totalIncome, icon: '💵', color: 'from-green-600 to-green-800', positive: true },
    { label: 'Total Expenses', value: stats.totalExpenses, icon: '💸', color: 'from-red-600 to-red-800', positive: false },
    { label: 'Net Profit', value: stats.netProfit, icon: '📈', color: stats.netProfit >= 0 ? 'from-emerald-600 to-emerald-800' : 'from-rose-600 to-rose-800', positive: stats.netProfit >= 0 },
    { label: 'Tax Deductions', value: stats.taxDeductions, icon: '🏛️', color: 'from-purple-600 to-purple-800', positive: true },
  ]

  const quickLinks = [
    { href: '/dashboard/finance/expenses', label: 'Expenses', icon: '💳', desc: 'Track business expenses' },
    { href: '/dashboard/finance/mileage', label: 'Mileage', icon: '🚗', desc: 'Log vehicle miles' },
    { href: '/dashboard/finance/reports', label: 'Reports', icon: '📊', desc: 'P&L and tax reports' },
  ]

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
          <h1 className="text-3xl font-bold">Finance</h1>
          <p className="text-zinc-500 mt-1">LLC financial overview and management</p>
        </div>
        <Link
          href="/dashboard/finance/expenses?add=true"
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          <span className="text-xl">+</span>
          <span>Add Expense</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {formatCurrency(stat.value)}
                </p>
              </div>
              <span className="text-4xl opacity-50">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-600/30 rounded-xl p-6 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl group-hover:scale-110 transition-transform">{link.icon}</span>
              <div>
                <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors">{link.label}</h3>
                <p className="text-sm text-zinc-500">{link.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link href="/dashboard/finance/expenses" className="text-red-500 hover:text-red-400 text-sm">
            View All →
          </Link>
        </div>
        <div className="divide-y divide-zinc-800">
          {recentTransactions.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <p className="text-4xl mb-4">💰</p>
              <p className="text-lg font-medium">No transactions yet</p>
              <p className="text-sm mt-1">Start tracking your income and expenses</p>
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <div
                key={`${tx.type}-${tx.id}`}
                className="p-4 hover:bg-zinc-800/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {tx.type === 'income' ? '💵' : tx.type === 'mileage' ? '🚗' : '💳'}
                  </span>
                  <div>
                    <p className="font-medium text-white">{tx.description}</p>
                    <p className="text-sm text-zinc-500">
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Financial data syncs in real-time</span>
      </div>
    </div>
  )
}
