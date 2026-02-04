'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    budget: '',
    timeline: '',
    description: ''
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setStatus('success')
        setFormData({
          name: '', email: '', phone: '', company: '',
          projectType: '', budget: '', timeline: '', description: ''
        })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-white tracking-tight">
          Losey<span className="text-red-500">.Co</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
            Home
          </Link>
          <Link href="/dashboard" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Let's Build Something <span className="text-red-500">Great</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Tell us about your project and we'll get back to you within 24 hours. 
            We specialize in websites for automotive shops, race teams, and technical businesses.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Message Received!</h2>
            <p className="text-neutral-400 mb-6">We'll review your project and get back to you soon.</p>
            <Link href="/" className="text-red-400 hover:text-red-300 font-medium">
              ← Back to Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-neutral-900/50 border border-neutral-700/50 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-neutral-300 text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-neutral-300 text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-neutral-300 text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-neutral-300 text-sm font-medium mb-2">Company/Team</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Your business or team name"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-neutral-300 text-sm font-medium mb-2">Project Type *</label>
                <select
                  required
                  value={formData.projectType}
                  onChange={e => setFormData({...formData, projectType: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                >
                  <option value="">Select type...</option>
                  <option value="website">Website / Landing Page</option>
                  <option value="webapp">Web Application</option>
                  <option value="ecommerce">E-Commerce Store</option>
                  <option value="redesign">Website Redesign</option>
                  <option value="consulting">Technical Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-300 text-sm font-medium mb-2">Budget Range</label>
                <select
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                >
                  <option value="">Select budget...</option>
                  <option value="500-1500">$500 - $1,500</option>
                  <option value="1500-3000">$1,500 - $3,000</option>
                  <option value="3000-5000">$3,000 - $5,000</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="10000+">$10,000+</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-300 text-sm font-medium mb-2">Timeline</label>
                <select
                  value={formData.timeline}
                  onChange={e => setFormData({...formData, timeline: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                >
                  <option value="">Select timeline...</option>
                  <option value="asap">ASAP</option>
                  <option value="2-weeks">2 weeks</option>
                  <option value="1-month">1 month</option>
                  <option value="2-3-months">2-3 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-neutral-300 text-sm font-medium mb-2">Project Description *</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none transition-colors resize-none"
                placeholder="Tell us about your project, goals, and any specific requirements..."
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>

            {status === 'error' && (
              <p className="text-red-400 text-center mt-4">Something went wrong. Please try again or email pj@losey.co directly.</p>
            )}
          </form>
        )}

        {/* Industries */}
        <div className="mt-16 text-center">
          <h3 className="text-neutral-400 text-sm uppercase tracking-wider mb-6">Industries We Serve</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['Race Teams', 'Auto Shops', 'Motorsport Services', 'Technical Businesses', 'Startups'].map(industry => (
              <span key={industry} className="bg-neutral-800/50 border border-neutral-700 px-4 py-2 rounded-lg text-neutral-300 text-sm">
                {industry}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
