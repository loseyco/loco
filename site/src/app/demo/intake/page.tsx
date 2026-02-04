'use client'

import HighVelocityIntake from '@/components/HighVelocityIntake'
import Link from 'next/link'

export default function IntakeDemoPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500 selection:text-white">
      {/* Background patterns */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-900/10 via-transparent to-black" />
      </div>

      <div className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-8 max-w-6xl mx-auto">
          <Link href="/" className="text-2xl font-black text-white tracking-tighter italic">
            LOSEY<span className="text-red-600">.CO</span>
          </Link>
          <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors font-mono text-xs tracking-widest uppercase">
            Exit Demo
          </Link>
        </nav>

        <div className="max-w-4xl mx-auto px-6 pt-12 pb-24">
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic mb-6 leading-none">
              High-Velocity <br />
              <span className="text-red-600">Intake</span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-xl font-medium leading-relaxed">
              Experience the fastest way to get your project from the shop floor to the production line. 
              Zero friction, maximum conversion.
            </p>
          </div>

          <HighVelocityIntake />
        </div>

        <footer className="py-12 border-t border-white/5 text-center">
          <p className="text-neutral-600 font-mono text-[10px] tracking-[0.2em] uppercase">
            © 2026 LoseyCo Operations — Performance Infrastructure
          </p>
        </footer>
      </div>
    </div>
  )
}
