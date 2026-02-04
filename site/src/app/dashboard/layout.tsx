'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { signOut } from '@/app/login/actions'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/projects', label: 'Projects', icon: '📁' },
  { href: '/dashboard/tasks', label: 'Tasks', icon: '✅' },
  { href: '/dashboard/invoices', label: 'Invoices', icon: '🧾' },
  { href: '/dashboard/finance', label: 'Finance', icon: '💰' },
  { href: '/dashboard/chat', label: 'Chat', icon: '💬' },
  { href: '/dashboard/logs', label: 'Logs', icon: '📋' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-500">Losey</span>
            <span className="text-2xl font-light text-zinc-400">.co</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600/20 text-red-500 border border-red-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign out and status */}
        <div className="p-4 border-t border-zinc-800 space-y-4">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Sign Out</span>
            </button>
          </form>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Real-time connected</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
