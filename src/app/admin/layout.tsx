'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'DB', exact: true },
  { href: '/admin/structures', label: 'Structures', icon: 'ST', exact: false },
  { href: '/admin/fiches', label: 'Fiches pratiques', icon: 'FP', exact: false },
  { href: '/admin/liens', label: 'Liens', icon: 'LI', exact: false },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Etat collapsed memorise dans localStorage
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('admin-sidebar-collapsed', String(next))
  }

  // Pas de layout sur la page login
  if (pathname === '/admin/login') return children

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className={`${collapsed ? 'w-16' : 'w-48'} flex-shrink-0 bg-gray-800 flex flex-col transition-all duration-200`}>
        {/* Logo container */}
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          {!collapsed && (
            <>
              <div className="w-7 h-7 bg-teal-400 rounded-md flex items-center justify-center text-white text-sm font-medium">
                R
              </div>
              <div>
                <p className="text-sm font-bold text-white">RESAP</p>
                <p className="text-[10px] text-white/50">
                  {process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'dev'}
                </p>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={toggle}
            title={collapsed ? 'Ouvrir le menu' : 'Reduire le menu'}
            className="ml-auto text-white/60 hover:text-white flex-shrink-0"
          >
            {collapsed ? '>' : '<'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {NAV.map(({ href, label, icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-teal-400 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold flex-shrink-0">{icon}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {!collapsed && (
          <div className="px-4 py-3 border-t border-white/10 text-[10px] text-white/30">
            <span className="inline-block px-2 py-1 rounded-full bg-white/5">
              * {process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'dev'}
            </span>
          </div>
        )}
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-auto p-5">
        {children}
      </main>
    </div>
  )
}
