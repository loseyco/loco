'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function WerkShopDemo() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-red-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tighter uppercase italic">The Werk Shop</span>
            <div className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
              <a href="#" className="hover:text-white transition-colors">Current Projects</a>
              <a href="#" className="hover:text-white transition-colors">Restoration Philosophy</a>
              <a href="#" className="hover:text-white transition-colors">Our Facility</a>
            </div>
          </div>
          <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold skew-x-[-12deg] transition-all">
            <span className="inline-block skew-x-[12deg]">Initiate Build</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden pt-20 border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A] z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center grayscale opacity-40 scale-105" />
        
        <div className="relative z-20 text-center space-y-6 max-w-4xl px-6">
          <p className="text-red-500 font-bold tracking-[0.3em] uppercase text-sm">Concours Excellence</p>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
            Restored.<br />Reimagined.<br />Reborn.
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            World-class BMW restoration and European performance engineering. 
            Track your build's heartbeats in real-time.
          </p>
        </div>
      </header>

      {/* Restoration Timeline (Singer-style Zig-Zag) */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="space-y-40">
          {/* Project 1 */}
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1 space-y-8">
              <div className="inline-flex items-center gap-4">
                <span className="w-12 h-[1px] bg-red-600" />
                <span className="text-red-500 font-bold uppercase tracking-widest text-xs font-mono">Stage 01</span>
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Strip to Chassis</h2>
              <p className="text-zinc-400 leading-relaxed text-lg">
                Every restoration begins with total transparency. We strip the vehicle down to the raw metal, 
                inspecting every weld, seam, and structural point for perfection.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Hours Logged</p>
                  <p className="text-3xl font-bold font-mono">142.5</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Status</p>
                  <p className="text-3xl font-bold text-green-500 italic uppercase">Verified</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[4/3] bg-zinc-900 overflow-hidden border border-zinc-800 relative group">
                 <div className="absolute inset-0 bg-red-600/10 group-hover:opacity-0 transition-opacity z-10" />
                 <img src="https://images.unsplash.com/photo-1486006396193-47101bb9106d?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale" alt="Strip to chassis" />
              </div>
            </div>
          </div>

          {/* Project 2 */}
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="order-1">
              <div className="aspect-[4/3] bg-zinc-900 overflow-hidden border border-zinc-800 relative group">
                 <div className="absolute inset-0 bg-red-600/10 group-hover:opacity-0 transition-opacity z-10" />
                 <img src="https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=2070" className="w-full h-full object-cover grayscale" alt="Engine build" />
              </div>
            </div>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-4">
                <span className="w-12 h-[1px] bg-red-600" />
                <span className="text-red-500 font-bold uppercase tracking-widest text-xs font-mono">Stage 02</span>
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Performance Blueprint</h2>
              <p className="text-zinc-400 leading-relaxed text-lg">
                The engine is blueprinted to tolerances beyond factory spec. Original aesthetics 
                meet modern cooling and fuel management.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Target HP</p>
                  <p className="text-3xl font-bold font-mono text-red-500">385hp</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Original</p>
                  <p className="text-3xl font-bold text-zinc-600 italic uppercase">168hp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Velocity Intake Module (Static Mock) */}
      <section className="bg-zinc-900 border-y border-zinc-800 py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Initiate Your Build</h2>
            <p className="text-zinc-400">Skip the static forms. Start the technical dialogue with our wizards.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Chassis Year / Make</label>
              <input type="text" placeholder="1973 BMW 2002" className="w-full bg-black border border-zinc-700 px-6 py-4 focus:border-red-500 outline-none transition-colors italic font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Build Philosophy</label>
              <select className="w-full bg-black border border-zinc-700 px-6 py-4 focus:border-red-500 outline-none transition-colors italic font-bold appearance-none">
                <option>Period Correct Restoration</option>
                <option>Performance Restomod</option>
                <option>NASA/SCCA Track Spec</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Target Horsepower</label>
              <input type="range" className="w-full accent-red-600 bg-zinc-800" />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                <span>Stock Spec</span>
                <span>Race Spec</span>
              </div>
            </div>
          </div>

          <button className="w-full py-6 bg-red-600 hover:bg-red-700 text-black font-black uppercase text-xl italic tracking-tighter skew-x-[-12deg] transition-all">
             <span className="inline-block skew-x-[12deg]">Request Build Slot</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 text-center border-t border-zinc-900">
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">A Losey.Co Speculation Project &copy; 2026</p>
      </footer>
    </div>
  )
}
