'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase, Invoice, Expense, MileageLog, ExpenseCategory } from '@/lib/supabase'

interface MonthlyData {
  month: string
  income: number
  expenses: number
  net: number
}

interface CategoryData {
  category: string
  amount: number
  color: string
  icon: string
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  
  // Data
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [mileage, setMileage] = useState<MileageLog[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  
  // Computed
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])

  const fetchData = useCallback(async () => {
    try {
      const [invoicesRes, expensesRes, mileageRes, catsRes] = await Promise.all([
        supabase.from('invoices').select('*').eq('status', 'paid'),
        supabase.from('expenses').select('*, category:expense_categories(*)'),
        supabase.from('mileage_log').select('*'),
        supabase.from('expense_categories').select('*'),
      ])

      const inv = (invoicesRes.data || []).filter((i: Invoice) => i.created_at.startsWith(filterYear))
      const exp = (expensesRes.data || []).filter((e: Expense) => e.date.startsWith(filterYear))
      const mil = (mileageRes.data || []).filter((m: MileageLog) => m.date.startsWith(filterYear))
      const cats = catsRes.data || []

      setInvoices(inv)
      setExpenses(exp)
      setMileage(mil)
      setCategories(cats)

      // Compute monthly data
      const monthMap: Record<string, { income: number; expenses: number }> = {}
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      months.forEach((m, i) => {
        const key = `${filterYear}-${String(i + 1).padStart(2, '0')}`
        monthMap[key] = { income: 0, expenses: 0 }
      })

      inv.forEach((i: Invoice) => {
        const key = i.created_at.substring(0, 7)
        if (monthMap[key]) monthMap[key].income += i.amount
      })

      exp.forEach((e: Expense) => {
        const key = e.date.substring(0, 7)
        if (monthMap[key]) monthMap[key].expenses += e.amount
      })

      const monthly: MonthlyData[] = Object.entries(monthMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, data]) => ({
          month: months[parseInt(month.split('-')[1]) - 1],
          income: data.income,
          expenses: data.expenses,
          net: data.income - data.expenses,
        }))

      setMonthlyData(monthly)

      // Compute category data
      const catMap: Record<string, { amount: number; color: string; icon: string }> = {}
      exp.forEach((e: Expense) => {
        const catName = e.category?.name || 'Uncategorized'
        const catColor = e.category?.color || '#6B7280'
        const catIcon = e.category?.icon || '📦'
        if (!catMap[catName]) {
          catMap[catName] = { amount: 0, color: catColor, icon: catIcon }
        }
        catMap[catName].amount += e.amount
      })

      const catData: CategoryData[] = Object.entries(catMap)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.amount - a.amount)

      setCategoryData(catData)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }, [filterYear])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  // Totals
  const totalIncome = invoices.reduce((sum, i) => sum + i.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalMileageDeduction = mileage.reduce((sum, m) => sum + (m.miles * m.deduction_rate), 0)
  const totalDeductible = expenses.filter(e => e.is_deductible).reduce((sum, e) => sum + e.amount, 0) + totalMileageDeduction * 100
  const netProfit = totalIncome - totalExpenses

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())

  // Export to CSV
  function exportToCSV() {
    const rows = [
      ['Losey.Co LLC Financial Report', filterYear],
      [],
      ['PROFIT & LOSS SUMMARY'],
      ['Total Income', formatCurrency(totalIncome)],
      ['Total Expenses', formatCurrency(totalExpenses)],
      ['Net Profit/Loss', formatCurrency(netProfit)],
      [],
      ['TAX DEDUCTIONS'],
      ['Deductible Expenses', formatCurrency(totalDeductible - totalMileageDeduction * 100)],
      ['Mileage Deduction', formatCurrency(totalMileageDeduction * 100)],
      ['Total Deductions', formatCurrency(totalDeductible)],
      [],
      ['MONTHLY BREAKDOWN'],
      ['Month', 'Income', 'Expenses', 'Net'],
      ...monthlyData.map(m => [m.month, formatCurrency(m.income), formatCurrency(m.expenses), formatCurrency(m.net)]),
      [],
      ['EXPENSES BY CATEGORY'],
      ['Category', 'Amount'],
      ...categoryData.map(c => [c.category, formatCurrency(c.amount)]),
      [],
      ['EXPENSE DETAILS'],
      ['Date', 'Description', 'Category', 'Vendor', 'Amount', 'Deductible'],
      ...expenses.map(e => [
        e.date,
        e.description,
        e.category?.name || 'Uncategorized',
        e.vendor || '',
        formatCurrency(e.amount),
        e.is_deductible ? 'Yes' : 'No'
      ]),
      [],
      ['MILEAGE LOG'],
      ['Date', 'Description', 'Miles', 'Deduction'],
      ...mileage.map(m => [
        m.date,
        m.description,
        m.miles.toString(),
        formatCurrency(m.miles * m.deduction_rate * 100)
      ]),
    ]

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `losey-co-finance-${filterYear}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const maxMonthlyValue = Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)), 1)
  const maxCategoryValue = Math.max(...categoryData.map(c => c.amount), 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
            <Link href="/dashboard/finance" className="hover:text-red-400">Finance</Link>
            <span>/</span>
            <span className="text-white">Reports</span>
          </div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-zinc-500 mt-1">P&L summary and tax filing data</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-lg">
          <p className="text-white/70 text-sm">Total Income</p>
          <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6 shadow-lg">
          <p className="text-white/70 text-sm">Total Expenses</p>
          <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-emerald-600 to-emerald-800' : 'from-rose-600 to-rose-800'} rounded-xl p-6 shadow-lg`}>
          <p className="text-white/70 text-sm">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
          <p className="text-3xl font-bold text-white mt-1">{formatCurrency(netProfit)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg">
          <p className="text-white/70 text-sm">Tax Deductions</p>
          <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalDeductible)}</p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">Monthly Income vs Expenses</h2>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-2 h-64">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 h-48 items-end">
                  <div
                    className="flex-1 bg-green-600 rounded-t transition-all"
                    style={{ height: `${(month.income / maxMonthlyValue) * 100}%`, minHeight: month.income > 0 ? '4px' : '0' }}
                    title={`Income: ${formatCurrency(month.income)}`}
                  />
                  <div
                    className="flex-1 bg-red-600 rounded-t transition-all"
                    style={{ height: `${(month.expenses / maxMonthlyValue) * 100}%`, minHeight: month.expenses > 0 ? '4px' : '0' }}
                    title={`Expenses: ${formatCurrency(month.expenses)}`}
                  />
                </div>
                <span className="text-xs text-zinc-500">{month.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-600 rounded" />
              <span className="text-sm text-zinc-400">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded" />
              <span className="text-sm text-zinc-400">Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">Expenses by Category</h2>
        </div>
        <div className="p-6">
          {categoryData.length === 0 ? (
            <div className="text-center text-zinc-500 py-8">
              <p>No expense data for {filterYear}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryData.map((cat) => {
                const percentage = ((cat.amount / totalExpenses) * 100).toFixed(1)
                return (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="font-medium text-white">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400">{percentage}%</span>
                        <span className="font-semibold text-red-400 w-28 text-right">{formatCurrency(cat.amount)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(cat.amount / maxCategoryValue) * 100}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">Monthly Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 text-left text-sm text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Month</th>
                <th className="px-6 py-4 font-medium text-right">Income</th>
                <th className="px-6 py-4 font-medium text-right">Expenses</th>
                <th className="px-6 py-4 font-medium text-right">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {monthlyData.map((month) => (
                <tr key={month.month} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{month.month}</td>
                  <td className="px-6 py-4 text-right text-green-400">{formatCurrency(month.income)}</td>
                  <td className="px-6 py-4 text-right text-red-400">{formatCurrency(month.expenses)}</td>
                  <td className={`px-6 py-4 text-right font-semibold ${month.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(month.net)}
                  </td>
                </tr>
              ))}
              <tr className="bg-zinc-800/50 font-bold">
                <td className="px-6 py-4 text-white">Total</td>
                <td className="px-6 py-4 text-right text-green-400">{formatCurrency(totalIncome)}</td>
                <td className="px-6 py-4 text-right text-red-400">{formatCurrency(totalExpenses)}</td>
                <td className={`px-6 py-4 text-right ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(netProfit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Deductions Summary */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">Tax Deductions Summary</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-zinc-800">
            <span className="text-zinc-400">Deductible Business Expenses</span>
            <span className="font-semibold text-purple-400">{formatCurrency(totalDeductible - totalMileageDeduction * 100)}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Vehicle Mileage</span>
              <span className="text-xs text-zinc-500">({mileage.reduce((sum, m) => sum + m.miles, 0).toLocaleString()} miles @ $0.67/mi)</span>
            </div>
            <span className="font-semibold text-purple-400">{formatCurrency(totalMileageDeduction * 100)}</span>
          </div>
          <div className="flex items-center justify-between py-3 bg-purple-600/10 rounded-lg px-4">
            <span className="font-semibold text-white">Total Tax Deductions</span>
            <span className="font-bold text-2xl text-purple-400">{formatCurrency(totalDeductible)}</span>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Report data syncs with your financial records in real-time</span>
      </div>
    </div>
  )
}
