'use client'

import { useEffect, useState } from 'react'
import { listLiens } from '@/services/contentful-management'

type LienItem = { id: string; titre: string; url?: string; hasFichier: boolean; statut: string }

type Props = {
  // Titre du bloc (ex: "Quelques outils")
  titre: string
  // IDs des liens actuellement sélectionnés
  selectedIds: string[]
  // Appelé quand la sélection change
  onChange: (ids: string[]) => void
}

export function LiensPicker({ titre, selectedIds, onChange }: Props) {
  const [liens, setLiens] = useState<LienItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const load = async () => {
    if (liens.length > 0) return // déjà chargé
    setLoading(true)
    try {
      setLiens(await listLiens())
    } finally {
      setLoading(false)
    }
  }

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const filteredLiens = liens.filter((l) =>
    l.titre.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div style={{ marginBottom: 8 }}>
      {/* En-tête du bloc avec bouton toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: 0 }}>{titre}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            {selectedIds.length} lien{selectedIds.length > 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={() => { setIsOpen(!isOpen); if (!isOpen) load() }}
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 5,
              border: '1px solid #e5e7eb',
              background: isOpen ? '#eff6ff' : 'white',
              color: isOpen ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            {isOpen ? '▲ Fermer' : '✏️ Modifier'}
          </button>
        </div>
      </div>

      {/* Liens sélectionnés (toujours visibles) */}
      {selectedIds.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          {selectedIds.map((id) => {
            const lien = liens.find((l) => l.id === id)
            if (!lien) return null
            return (
              <div key={id}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                background: '#eff6ff',
                borderRadius: 6,
                marginBottom: 3,
                fontSize: 12,
              }}
              >
                <span style={{ color: '#1d4ed8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {lien.hasFichier ? '📎' : '🔗'} {lien.titre}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: 13, padding: '0 0 0 6px', flexShrink: 0 }}
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Picker ouvert */}
      {isOpen && (
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
          background: 'white',
        }}
        >
          {/* Recherche */}
          <div style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un lien..."
              style={{
                width: '100%',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '5px 8px',
                fontSize: 12,
                outline: 'none',
                boxSizing: 'border-box',
              }}

            />
          </div>

          {/* Liste */}
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {loading && (
              <p style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
                Chargement...
              </p>
            )}
            {!loading && filteredLiens.length === 0 && (
              <p style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
                Aucun lien trouvé
              </p>
            )}
            {filteredLiens.map((lien) => {
              const isSelected = selectedIds.includes(lien.id)
              return (
                <label
                  key={lien.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : 'transparent',
                    transition: 'background 0.1s',
                    borderBottom: '1px solid #f9fafb',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f9fafb' }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(lien.id)}
                    style={{ width: 14, height: 14, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lien.hasFichier ? '📎' : '🔗'} {lien.titre}
                    </p>
                    {lien.url && (
                      <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lien.url}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 20,
                    background: lien.statut === 'published' ? '#dcfce7' : '#fef9c3',
                    color: lien.statut === 'published' ? '#166534' : '#854d0e',
                    flexShrink: 0,
                  }}
                  >
                    {lien.statut === 'published' ? 'Publié' : 'Draft'}
                  </span>
                </label>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '6px 10px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: 11,
                padding: '4px 12px',
                borderRadius: 5,
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
