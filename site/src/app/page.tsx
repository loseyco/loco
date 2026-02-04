import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
        <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
          <div className="text-2xl font-bold text-white tracking-tight">
            Losey<span className="text-red-500">.Co</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="https://gridpass.app" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
              GridPass
            </Link>
            <Link href="https://pjlosey.com" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
              Resume
            </Link>
            <Link href="mailto:pj@losey.co" className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Contact
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-red-300 text-sm font-medium">Available for projects</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Engineering<br />
              <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                Excellence
              </span>
            </h1>
            <p className="text-xl text-neutral-400 mb-8 max-w-2xl leading-relaxed">
              Technical services spanning motorsport engineering, medical systems, and software development. 
              From proton therapy installations to IndyCar trackside support — we deliver precision where it matters.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="mailto:pj@losey.co" className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
                Get in Touch
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="https://gridpass.app" className="border border-neutral-600 text-white hover:border-neutral-500 hover:bg-neutral-800/50 px-6 py-3 rounded-lg font-semibold transition-colors">
                View GridPass
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="py-24 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard 
              icon="🏎️"
              title="Motorsport Engineering"
              description="Trackside data engineering, race strategy, and team management for professional racing series including IndyCar, World Challenge, and Grand-AM."
            />
            <ServiceCard 
              icon="⚡"
              title="Medical Systems"
              description="Installation and commissioning of advanced medical equipment. Lead engineer on Varian ProBeam360 proton therapy system installation."
            />
            <ServiceCard 
              icon="💻"
              title="Software Development"
              description="Full-stack development with React, Next.js, Supabase, and Vercel. Building GridPass.app and custom solutions for technical teams."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-neutral-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatBlock number="20+" label="Years Experience" />
            <StatBlock number="100+" label="Projects Completed" />
            <StatBlock number="3" label="Industries" />
            <StatBlock number="2002" label="Founded" />
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-24 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Featured Project</h2>
          <div className="bg-gradient-to-r from-red-900/40 to-red-800/30 border border-red-500/20 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="text-red-400 font-semibold mb-2">GridPass.app</div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Racing Data & Team Management Platform
                </h3>
                <p className="text-neutral-400 mb-6">
                  A comprehensive platform for motorsport professionals to track careers, manage teams, 
                  and connect with the racing community. Built with Next.js and Supabase.
                </p>
                <Link href="https://gridpass.app" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors">
                  Visit GridPass
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
              <div className="w-full md:w-80 h-48 bg-gradient-to-br from-red-900/50 to-neutral-800 rounded-xl flex items-center justify-center border border-red-500/20">
                <span className="text-6xl">🏁</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-neutral-400 text-sm">
            © {new Date().getFullYear()} Losey.Co — Monmouth, IL
          </div>
          <div className="flex items-center gap-6">
            <SocialLink href="https://twitter.com/loseyco" label="Twitter" />
            <SocialLink href="https://github.com/loseyco" label="GitHub" />
            <SocialLink href="https://facebook.com/loseyco" label="Facebook" />
          </div>
        </div>
      </footer>
    </div>
  )
}

function ServiceCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-xl p-6 hover:border-red-500/50 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{description}</p>
    </div>
  )
}

function StatBlock({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-red-500 mb-1">{number}</div>
      <div className="text-neutral-400 text-sm">{label}</div>
    </div>
  )
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-neutral-400 hover:text-red-400 transition-colors text-sm">
      {label}
    </Link>
  )
}
