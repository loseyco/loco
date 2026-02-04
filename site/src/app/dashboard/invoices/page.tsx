'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Invoice } from '@/lib/supabase'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()

    // Real-time subscription
    const sub = supabase
      .channel('invoices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        fetchInvoices()
      })
      .subscribe()

    return () => {
      sub.unsubscribe()
    }
  }, [])

  async function fetchInvoices() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  async function sendInvoice(invoice: Invoice) {
    if (!invoice.id) return

    try {
      // Create Stripe checkout session
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })

      const data = await res.json()

      if (data.error) {
        alert(data.error)
        return
      }

      // Update invoice with payment URL
      await supabase
        .from('invoices')
        .update({ 
          status: 'sent', 
          payment_url: data.url,
          stripe_session_id: data.sessionId 
        })
        .eq('id', invoice.id)

      alert(`Invoice sent! Payment link: ${data.url}`)
    } catch (error) {
      console.error('Error sending invoice:', error)
      alert('Failed to create payment link')
    }
  }

  const statusColors = {
    draft: 'bg-zinc-600/20 text-zinc-400',
    sent: 'bg-yellow-600/20 text-yellow-400',
    paid: 'bg-green-600/20 text-green-400',
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-zinc-500 mt-1">Manage client invoices and payments</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          <span className="text-xl">+</span>
          <span>New Invoice</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700">
          <p className="text-zinc-400 text-sm">Draft</p>
          <p className="text-2xl font-bold text-white mt-1">
            {invoices.filter(i => i.status === 'draft').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-950/30 rounded-xl p-6 border border-yellow-800/30">
          <p className="text-yellow-400 text-sm">Awaiting Payment</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatCurrency(
              invoices
                .filter(i => i.status === 'sent')
                .reduce((sum, i) => sum + i.amount, 0)
            )}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-green-950/30 rounded-xl p-6 border border-green-800/30">
          <p className="text-green-400 text-sm">Paid</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatCurrency(
              invoices
                .filter(i => i.status === 'paid')
                .reduce((sum, i) => sum + i.amount, 0)
            )}
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">All Invoices</h2>
        </div>
        
        {invoices.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <p className="text-4xl mb-4">📄</p>
            <p className="text-lg font-medium">No invoices yet</p>
            <p className="text-sm mt-1">Create your first invoice to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50 text-left text-sm text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{invoice.client_name}</p>
                        <p className="text-sm text-zinc-500">{invoice.client_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 max-w-xs truncate">
                      {invoice.description}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => sendInvoice(invoice)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                          >
                            Send
                          </button>
                        )}
                        {invoice.status === 'sent' && invoice.payment_url && (
                          <button
                            onClick={() => navigator.clipboard.writeText(invoice.payment_url!)}
                            className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Copy Link
                          </button>
                        )}
                        {invoice.status === 'paid' && (
                          <span className="text-green-400 text-sm">✓ Complete</span>
                        )}
                      </div>
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
        <span>Updates appear automatically when payments are received</span>
      </div>
    </div>
  )
}
