'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface DashboardShellProps {
  children: React.ReactNode
  user: {
    username: string
    email: string
    role: 'admin' | 'user'
  }
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Single Sidebar - responsive positioning */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out
          lg:static lg:transform-none lg:transition-none lg:flex-shrink-0 lg:pointer-events-auto
          ${sidebarOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none lg:translate-x-0'}
        `}
      >
        <Sidebar userRole={user.role} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {children}
        </main>
        <footer className="shrink-0 border-t bg-card py-3 px-4 text-center text-sm text-muted-foreground">
          Copyright © 2025{' '}
          <a
            href="https://orchidsw.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Orchid Software
          </a>
          . All rights reserved.
        </footer>
      </div>
    </div>
  )
}
