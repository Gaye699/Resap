'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'

export type Action = {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
  divider?: boolean // ligne de séparation avant cet item
}

type Props = {
  actions: Action[]
}

export function ActionMenu({ actions }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Ferme si clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bouton déclencheur */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        style={{
          background: 'none',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: '4px 10px',
          cursor: 'pointer',
          fontSize: 16,
          color: '#64748b',
          lineHeight: 1,
          transition: 'all 0.1s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f8fafc'
          e.currentTarget.style.borderColor = '#cbd5e1'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none'
          e.currentTarget.style.borderColor = '#e2e8f0'
        }}
        title="Actions"
      >
        ⋯
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 180,
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {actions.map((action, i) => (
            <div key={action.label}>
              {action.divider && i > 0 && (
                <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
              )}
              <button
                type="button"
                onClick={() => { action.onClick(); setOpen(false) }}
                disabled={action.disabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '9px 14px',
                  background: 'none',
                  border: 'none',
                  cursor: action.disabled ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  color: action.variant === 'danger' ? '#ef4444' : '#374151',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                  opacity: action.disabled ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!action.disabled) {
                    e.currentTarget.style.background = action.variant === 'danger' ? '#fef2f2' : '#f8fafc'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none'
                }}
              >
                {action.icon && <span className="w-4 h-4 flex-shrink-0">{action.icon}</span>}
                {action.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
