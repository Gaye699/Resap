// src/components/admin/editor/EditorToolbar.tsx
// Barre du haut fixe : nom de la ressource, statut, boutons sauvegarder/publier.

'use client'

import Link from 'next/link'
import { useEditor } from './EditorContext'

type Props = {
  titre: string
  backHref: string
}

export function EditorToolbar({ titre, backHref }: Props) {
  const { isDirty, isSaving, isPublished, save, publish } = useEditor()

  return (
    <div
      style={{
        height: 52,
        background: '#111827',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {/* Lien retour */}
      <Link
        href={backHref}
        style={{
          color: '#9ca3af',
          textDecoration: 'none',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          borderRadius: 5,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#1f2937' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        ← Retour
      </Link>

      {/* Séparateur */}
      <div style={{ width: 1, height: 20, background: '#374151' }} />

      {/* Titre */}
      <span style={{ fontSize: 13, fontWeight: 500, color: '#f3f4f6', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {titre}
      </span>

      {/* Indicateur de modification non sauvegardée */}
      {isDirty && (
        <span style={{
          fontSize: 11,
          color: '#fbbf24',
          background: 'rgba(251,191,36,0.1)',
          padding: '2px 8px',
          borderRadius: 20,
          border: '1px solid rgba(251,191,36,0.2)',
        }}
        >
          ● Modifications non sauvegardées
        </span>
      )}

      {/* Badge statut */}
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        padding: '3px 10px',
        borderRadius: 20,
        background: isPublished ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
        color: isPublished ? '#4ade80' : '#fbbf24',
        border: `1px solid ${isPublished ? 'rgba(74,222,128,0.2)' : 'rgba(251,191,36,0.2)'}`,
      }}
      >
        {isPublished ? '● Publié' : '○ Brouillon'}
      </span>

      {/* Bouton Sauvegarder */}
      <button
        type="button"
        onClick={save}
        disabled={isSaving || !isDirty}
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: '6px 14px',
          borderRadius: 6,
          border: '1px solid #374151',
          background: isDirty && !isSaving ? '#1f2937' : 'transparent',
          color: isDirty && !isSaving ? '#f9fafb' : '#6b7280',
          cursor: isDirty && !isSaving ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
        }}
      >
        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>

      {/* Bouton Publier */}
      <button
        type="button"
        onClick={publish}
        disabled={isSaving}
        style={{
          fontSize: 12,
          fontWeight: 600,
          padding: '6px 14px',
          borderRadius: 6,
          border: 'none',
          background: isSaving ? '#374151' : '#16a34a',
          color: 'white',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.background = '#15803d' }}
        onMouseLeave={(e) => { if (!isSaving) e.currentTarget.style.background = '#16a34a' }}
      >
        Publier sur le site
      </button>
    </div>
  )
}
