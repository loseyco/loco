'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function WerkShopDemo() {
  const [activeTab, setActiveTab] = useState('timeline');

  const carDetails = {
    make: "BMW",
    model: "3.0 CS",
    year: "1973",
    chassis: "2262554",
    owner: "M. Kaufmann",
    estimatedCompletion: "August 2026",
    daysInShop: 142,
    percentComplete: 65,
    status: "In Progress - Body & Paint",
  };

  const timelineSteps = [
    {
      id: 1,
      title: "Intake & Assessment",
      date: "Oct 12, 2025",
      status: "completed",
      description: "Full vehicle inspection, documentation of original parts, and restoration plan finalization.",
      details: ["Numbers matching verification", "Rust assessment", "Parts inventory"],
    },
    {
      id: 2,
      title: "Disassembly",
      date: "Nov 5, 2025",
      status: "completed",
      description: "Complete strip-down to bare metal. Cataloging and storage of all components.",
      details: ["Engine removal", "Interior removal", "Glass & Trim storage"],
    },
    {
      id: 3,
      title: "Metal Work & Fabrication",
      date: "Jan 15, 2026",
      status: "completed",
      description: "Rust repair, panel replacement, and body alignment on the Celette jig.",
      details: ["Floor pan replacement", "Quarter panel repair", "Structural reinforcement"],
    },
    {
      id: 4,
      title: "Body & Paint",
      date: "Mar 1, 2026",
      status: "current",
      description: "Block sanding, priming, and application of the original Fjord Blue Metallic finish.",
      details: ["Surface leveling", "Epoxy priming", "Color matching"],
    },
    {
      id: 5,
      title: "Mechanical Restoration",
      date: "Est. May 2026",
      status: "pending",
      description: "Full rebuild of the M30 straight-six, suspension, and drivetrain components.",
      details: ["Engine rebuild", "Suspension powder coating", "Brake system overhaul"],
    },
    {
      id: 6,
      title: "Final Assembly",
      date: "Est. July 2026",
      status: "pending",
      description: "Installation of interior, glass, trim, and mechanical systems.",
      details: ["Leather upholstery", "Wiring harness installation", "Chrome trim fitment"],
    },
  ];

  const stats = [
    { label: "Stages Complete", value: "3 of 6" },
    { label: "Hours Logged", value: "842" },
    { label: "Parts Sourced", value: "92%" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e1e1e6] font-sans selection:bg-[#c1a35f] selection:text-black">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        .luxury-gradient {
          background: linear-gradient(135deg, #161618 0%, #0a0a0b 100%);
        }

        .gold-glow {
          box-shadow: 0 0 20px rgba(193, 163, 95, 0.15);
        }

        .border-gold {
          border-color: rgba(193, 163, 95, 0.3);
        }

        .text-gold {
          color: #c1a35f;
        }

        .bg-gold {
          background-color: #c1a35f;
        }

        .timeline-line {
          background: linear-gradient(to bottom, #c1a35f 0%, #161618 100%);
        }

        .brushed-metal {
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-serif tracking-tighter">
            THE <span className="text-gold">WERK</span> SHOP
          </div>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <div className="hidden md:flex items-center gap-2 font-mono text-xs tracking-widest text-white/40 uppercase">
            <span>Private Client Portal</span>
            <span className="text-gold">●</span>
            <span>Secure Access</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Client</div>
            <div className="text-sm font-medium">{carDetails.owner}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
            <span className="text-gold font-bold">MK</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Car Hero Card */}
        <section className="relative mb-12 overflow-hidden rounded-2xl border border-white/5 luxury-gradient">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 brushed-metal opacity-20 pointer-events-none" />
          
          <div className="relative z-10 p-8 md:p-12 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-mono tracking-[0.2em] uppercase mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                </span>
                Active Restoration
              </div>
              <h1 className="text-5xl md:text-7xl font-serif mb-4 leading-none">
                {carDetails.year} <span className="text-gold">{carDetails.model}</span>
              </h1>
              <p className="text-xl text-white/60 font-light mb-8 max-w-md">
                Chassis #{carDetails.chassis} — Preserving automotive history through meticulous craftsmanship.
              </p>
              
              <div className="flex flex-wrap gap-8">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-xs font-mono text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                    <div className="text-2xl font-serif">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="aspect-[16/10] bg-zinc-900 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center group-hover:border-gold/30 transition-colors duration-500">
                <div className="text-center transition-transform duration-700 group-hover:scale-110">
                  <div className="text-6xl mb-4">🚙</div>
                  <div className="font-mono text-[10px] tracking-[0.3em] text-white/20 uppercase">Stage 4: Paint Prep</div>
                </div>
                {/* Visual "Lens" overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent opacity-40" />
                <div className="absolute bottom-4 left-4 font-mono text-[10px] text-white/40 tracking-widest">CAM_01 // LIVE_STATUS</div>
              </div>
              {/* Decorative corner */}
              <div className="absolute -top-2 -right-2 w-12 h-12 border-t-2 border-r-2 border-gold/50 rounded-tr-xl pointer-events-none" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-2 border-l-2 border-gold/50 rounded-bl-xl pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Content Tabs */}
        <div className="flex gap-8 border-b border-white/5 mb-12 font-mono text-xs uppercase tracking-[0.2em]">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`pb-4 transition-colors relative ${activeTab === 'timeline' ? 'text-gold' : 'text-white/40 hover:text-white'}`}
          >
            Restoration Timeline
            {activeTab === 'timeline' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
          </button>
          <button 
            onClick={() => setActiveTab('documentation')}
            className={`pb-4 transition-colors relative ${activeTab === 'documentation' ? 'text-gold' : 'text-white/40 hover:text-white'}`}
          >
            Documentation & Files
            {activeTab === 'documentation' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`pb-4 transition-colors relative ${activeTab === 'billing' ? 'text-gold' : 'text-white/40 hover:text-white'}`}
          >
            Billing & Invoices
            {activeTab === 'billing' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
          </button>
        </div>

        {/* Timeline Content */}
        {activeTab === 'timeline' && (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left: Summary */}
            <div className="lg:col-span-1 space-y-8">
              <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                <h3 className="font-serif text-2xl mb-6">Current Progress</h3>
                <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${carDetails.percentComplete}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gold gold-glow"
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] tracking-widest text-white/40 uppercase mb-8">
                  <span>Inception</span>
                  <span className="text-gold">{carDetails.percentComplete}% Complete</span>
                  <span>Completion</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">Status</div>
                    <div className="text-sm font-medium text-gold">{carDetails.status}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">Est. Completion</div>
                    <div className="text-sm font-medium">{carDetails.estimatedCompletion}</div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <button className="w-full py-4 rounded-xl bg-gold text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#d4b570] transition-colors">
                      Contact Lead Artisan
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                <h3 className="font-serif text-xl mb-4">Restoration Ethics</h3>
                <p className="text-sm text-white/50 leading-relaxed font-light">
                  At The Werk Shop, we adhere to the highest standards of historical accuracy. Every bolt is torqued to factory spec, and every material choice honors the original engineering intent of BMW.
                </p>
              </div>
            </div>

            {/* Right: Vertical Timeline */}
            <div className="lg:col-span-2 relative">
              <div className="absolute left-[27px] top-8 bottom-8 w-px bg-white/5" />
              
              <div className="space-y-12">
                {timelineSteps.map((step, idx) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="relative pl-16 group"
                  >
                    {/* Circle Indicator */}
                    <div className={`absolute left-0 top-0 w-14 h-14 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
                      step.status === 'completed' 
                        ? 'bg-gold border-4 border-[#0a0a0b]' 
                        : step.status === 'current'
                          ? 'bg-[#0a0a0b] border-4 border-gold gold-glow'
                          : 'bg-[#0a0a0b] border-2 border-white/10'
                    }`}>
                      {step.status === 'completed' ? (
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : step.status === 'current' ? (
                        <div className="w-3 h-3 bg-gold rounded-full animate-pulse" />
                      ) : (
                        <span className="text-white/20 font-mono text-xs">{step.id}</span>
                      )}
                    </div>

                    <div className={`p-8 rounded-2xl border transition-all duration-500 ${
                      step.status === 'current' 
                        ? 'border-gold/50 bg-gold/5' 
                        : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.02]'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className={`text-[10px] font-mono tracking-[0.3em] uppercase mb-1 ${
                            step.status === 'current' ? 'text-gold' : 'text-white/40'
                          }`}>
                            {step.date}
                          </div>
                          <h4 className="text-xl font-serif">{step.title}</h4>
                        </div>
                        {step.status === 'completed' && (
                          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono tracking-widest uppercase">
                            Verified
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-white/50 leading-relaxed mb-6 font-light">
                        {step.description}
                      </p>

                      <div className="flex flex-wrap gap-x-8 gap-y-2">
                        {step.details.map((detail, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-gold/50" />
                            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{detail}</span>
                          </div>
                        ))}
                      </div>

                      {/* Photo Placeholder */}
                      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[1, 2].map((p) => (
                          <div key={p} className="aspect-video bg-black/40 rounded-lg border border-white/5 flex items-center justify-center group-hover:border-gold/20 transition-colors">
                            <span className="text-xl opacity-20">📸</span>
                          </div>
                        ))}
                        {step.status === 'current' && (
                          <div className="aspect-video bg-gold/10 rounded-lg border border-gold/20 flex items-center justify-center cursor-pointer hover:bg-gold/20 transition-colors">
                            <div className="text-center">
                              <div className="text-gold text-lg mb-1">+</div>
                              <div className="text-[8px] font-mono text-gold uppercase tracking-tighter">View Gallery</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty states for other tabs */}
        {activeTab !== 'timeline' && (
          <div className="py-24 text-center">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="font-serif text-2xl mb-2">Accessing Records...</h3>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Secure connection established. Decrypting vault.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="font-serif text-lg tracking-tighter mb-2">THE <span className="text-gold">WERK</span> SHOP</div>
            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">© 2026 Libertyville, Illinois</div>
          </div>
          
          <div className="flex gap-12">
            <div className="text-center">
              <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">Support</div>
              <div className="text-sm text-gold hover:underline cursor-pointer transition-all">Artisan Line</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">Legacy</div>
              <div className="text-sm text-gold hover:underline cursor-pointer transition-all">Registry</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Vault Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
