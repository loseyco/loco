'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    amount: '',
    description: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert dollars to cents for Stripe
      const amountInCents = Math.round(parseFloat(formData.amount) * 100)

      if (isNaN(amountInCents) || amountInCents <= 0) {
        alert('Please enter a valid amount')
        setLoading(false)
        return
      }

      const { error } = await supabase.from('invoices').insert({
        client_name: formData.client_name,
        client_email: formData.client_email,
        amount: amountInCents,
        description: formData.description,
        status: 'draft',
      })

      if (error) throw error

      router.push('/dashboard/invoices')
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <span>←</span>
          <span>Back to Invoices</span>
        </Link>
        <h1 className="text-3xl font-bold">Create Invoice</h1>
        <p className="text-zinc-500 mt-1">Send a payment request to your client</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
          {/* Client Name */}
          <div>
            <label htmlFor="client_name" className="block text-sm font-medium text-zinc-300 mb-2">
              Client Name
            </label>
            <input
              type="text"
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              required
              placeholder="Acme Corporation"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>

          {/* Client Email */}
          <div>
            <label htmlFor="client_email" className="block text-sm font-medium text-zinc-300 mb-2">
              Client Email
            </label>
            <input
              type="email"
              id="client_email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              required
              placeholder="billing@acme.com"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-zinc-300 mb-2">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              placeholder="Website development - Phase 1 deliverables&#10;&#10;• Homepage design&#10;• About page&#10;• Contact form"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Preview Card */}
        {(formData.client_name || formData.amount) && (
          <div className="bg-gradient-to-br from-red-900/20 to-red-950/20 rounded-xl border border-red-800/30 p-6">
            <p className="text-sm text-red-400 font-medium mb-3">Preview</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{formData.client_name || 'Client Name'}</p>
                <p className="text-zinc-400 text-sm">{formData.description || 'Invoice description'}</p>
              </div>
              <p className="text-2xl font-bold text-white">
                ${formData.amount ? parseFloat(formData.amount).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              'Create Invoice'
            )}
          </button>
          <Link
            href="/dashboard/invoices"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <span className="text-xl">💡</span>
          <div className="text-sm text-zinc-400">
            <p className="font-medium text-zinc-300">How it works</p>
            <p className="mt-1">
              Create an invoice as a draft, then click &ldquo;Send&rdquo; to generate a Stripe payment link.
              Your client will receive a secure checkout page to complete payment.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
