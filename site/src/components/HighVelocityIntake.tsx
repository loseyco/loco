'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type FormData = {
  name: string
  email: string
  phone: string
  company: string
  projectType: string
  budget: string
  timeline: string
  description: string
  vehicleDetails?: string
}

const STEPS = [
  { id: 'service', title: 'What do you need?' },
  { id: 'project', title: 'Project Details' },
  { id: 'business', title: 'About You' },
  { id: 'logistics', title: 'Budget & Timeline' },
  { id: 'review', title: 'Review' }
]

export default function HighVelocityIntake() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    budget: '',
    timeline: '',
    description: '',
    vehicleDetails: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const progress = ((step + 1) / STEPS.length) * 100

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const handlePrev = () => setStep(s => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setIsSuccess(true)
      }
    } catch (err) {
      console.error('Submit failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-20 bg-neutral-900/50 border border-red-500/20 rounded-3xl p-12">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl mb-6"
        >
          🏁
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">Finish Line Reached!</h2>
        <p className="text-neutral-400 mb-8 max-w-md mx-auto">
          Your intake data has been captured. Our team will review your project and get back to you within 24 hours.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold transition-all"
        >
          Return to Pits
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Velocity Gauge (Progress Bar) */}
      <div className="mb-12 relative h-2 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        />
        <div className="absolute inset-0 flex justify-between px-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-1 h-full ${i <= step ? 'bg-white/20' : 'bg-transparent'}`} />
          ))}
        </div>
      </div>

      <div className="relative min-h-[450px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            <div className="mb-8">
              <span className="text-red-500 font-mono text-sm tracking-widest uppercase mb-2 block">
                Step {step + 1} of {STEPS.length}
              </span>
              <h2 className="text-3xl font-bold text-white">{STEPS[step].title}</h2>
            </div>

            {/* Step Content */}
            <div className="space-y-6">
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'website', label: 'Custom Website', icon: '🌐' },
                    { id: 'webapp', label: 'Technical Web App', icon: '⚙️' },
                    { id: 'ecommerce', label: 'Parts Store / E-Com', icon: '🛒' },
                    { id: 'consulting', label: 'Systems Consulting', icon: '🧠' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setFormData({...formData, projectType: item.id});
                        handleNext();
                      }}
                      className={`p-6 rounded-2xl border-2 text-left transition-all group ${
                        formData.projectType === item.id 
                        ? 'border-red-500 bg-red-500/5' 
                        : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <div className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">{item.label}</div>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-neutral-400 text-sm mb-2">Vehicle / Project Focus</label>
                    <input 
                      type="text"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-red-500 outline-none transition-all"
                      placeholder="e.g. 1992 Porsche 964 Restoration, Race Team CMS, etc."
                      value={formData.vehicleDetails}
                      onChange={e => setFormData({...formData, vehicleDetails: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-sm mb-2">Project Description</label>
                    <textarea 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-red-500 outline-none transition-all h-32 resize-none"
                      placeholder="What are the main goals for this project?"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-neutral-400 text-sm mb-2">Company / Team Name</label>
                    <input 
                      type="text"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-red-500 outline-none transition-all"
                      placeholder="LoseyCo Motorsports"
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-sm mb-2">Full Name</label>
                    <input 
                      type="text"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-red-500 outline-none transition-all"
                      placeholder="PJ Losey"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-sm mb-2">Email Address</label>
                    <input 
                      type="email"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-red-500 outline-none transition-all"
                      placeholder="pj@losey.co"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-neutral-400 text-sm mb-4">Investment Level (Budget)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['1.5k-3k', '3k-5k', '5k-10k', '10k-20k', '20k+'].map(b => (
                        <button
                          key={b}
                          onClick={() => setFormData({...formData, budget: b})}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                            formData.budget === b 
                            ? 'border-red-500 bg-red-500 text-white' 
                            : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/30'
                          }`}
                        >
                          ${b}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-sm mb-4">Target Launch</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['ASAP', '1 Month', '3 Months', 'Flexible'].map(t => (
                        <button
                          key={t}
                          onClick={() => setFormData({...formData, timeline: t})}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                            formData.timeline === t 
                            ? 'border-red-500 bg-red-500 text-white' 
                            : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/30'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-neutral-400">Service</span>
                    <span className="text-white font-bold uppercase">{formData.projectType}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-neutral-400">Budget</span>
                    <span className="text-white font-bold">${formData.budget}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-neutral-400">Contact</span>
                    <span className="text-white font-bold">{formData.name}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-neutral-400 block mb-1">Details</span>
                    <p className="text-white text-sm italic">"{formData.description}"</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={handlePrev}
                className={`text-neutral-400 hover:text-white transition-colors font-medium flex items-center gap-2 ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              
              {step < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={step === 0 && !formData.projectType}
                  className="bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed px-10 py-4 rounded-full font-bold transition-all flex items-center gap-2"
                >
                  Next Step
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-500 text-white px-12 py-4 rounded-full font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  {isSubmitting ? 'Igniting...' : 'Full Throttle'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
