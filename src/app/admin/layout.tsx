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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: collapsed ? 56 : 220,
          minHeight: '100vh',
          background: '#0f172a',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 0.2s ease',
          overflow: 'hidden',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Header sidebar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '16px 0' : '16px 16px',
            borderBottom: '1px solid #1e293b',
            flexShrink: 0,
          }}
        >
          {!collapsed && (
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, margin: 0, whiteSpace: 'nowrap' }}>
                RESAP Admin
              </p>
              <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0', whiteSpace: 'nowrap' }}>
                {process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'dev'}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={toggle}
            title={collapsed ? 'Ouvrir le menu' : 'Reduire le menu'}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: 18,
              padding: 4,
              lineHeight: 1,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {collapsed ? '>' : '<'}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflow: 'hidden' }}>
          {NAV.map(({ href, label, icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '10px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 8,
                  marginBottom: 2,
                  textDecoration: 'none',
                  background: isActive ? '#1e293b' : 'transparent',
                  color: isActive ? '#f1f5f9' : '#94a3b8',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#1e293b'
                  if (!isActive) e.currentTarget.style.color = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                  if (!isActive) e.currentTarget.style.color = '#94a3b8'
                }}
              >
                <span style={{ fontSize: 13, flexShrink: 0, fontWeight: 700 }}>{icon}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {!collapsed && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #1e293b',
              fontSize: 11,
              color: '#475569',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 20,
                background: '#1e293b',
                color: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT === 'master' ? '#f87171' : '#4ade80',
              }}
            >
              * {process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'dev'}
            </span>
          </div>
        )}
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
