'use client'

import { useEffect, useState } from 'react'
import { listLiens, createLienAndLinkToFiche } from '@/services/contentful-management'
import toast from 'react-hot-toast'

type LienItem = {
  id: string
  titre: string
  url?: string
  hasFichier: boolean
  statut: string
}

type Props = {
  titre: string
  selectedIds: string[]
  onChange: (ids: string[]) => void
  ficheId?: string
  bloc?: 'outils' | 'patients' | 'pourEnSavoirPlus'
}

export function LiensPicker({ titre, selectedIds, onChange, ficheId, bloc }: Props) {
  const [allLiens, setAllLiens] = useState<LienItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  // Un seul état d'ouverture — plus de double bouton
  const [mode, setMode] = useState<'closed' | 'picker' | 'create'>('closed')
  const [newTitre, setNewTitre] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [creating, setCreating] = useState(false)

  // Charge les liens au premier ouverture du picker
  useEffect(() => {
    if (mode === 'picker' && allLiens.length === 0) {
      setLoading(true)
      listLiens()
        .then(setAllLiens)
        .finally(() => setLoading(false))
    }
  }, [mode])

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    )
  }

  const handleCreate = async () => {
    if (!newTitre.trim()) {
      toast.error('Le titre est obligatoire.')
      return
    }
    if (!ficheId || !bloc) {
      toast.error('Sauvegardez la fiche d\'abord.')
      return
    }
    setCreating(true)
    try {
      const { id } = await createLienAndLinkToFiche(ficheId, bloc, {
        titre: newTitre.trim(),
        url: newUrl.trim() || undefined,
      })
      onChange([...selectedIds, id])
      const updated = await listLiens()
      setAllLiens(updated)
      setNewTitre('')
      setNewUrl('')
      setMode('closed')
      toast.success('Lien créé et associé.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur.')
    } finally {
      setCreating(false)
    }
  }

  const selectedLiens = selectedIds
    .map((id) => allLiens.find((l) => l.id === id))
    .filter((l): l is LienItem => !!l)

  const filteredLiens = allLiens.filter((l) =>
    l.titre.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-2">

      {/* Liens sélectionnés */}
      {selectedIds.length > 0 && (
        <div className="space-y-1">
          {selectedLiens.map((lien) => (
            <div
              key={lien.id}
              className="flex items-center justify-between bg-blue-50
                border border-blue-100 rounded-lg px-3 py-2"
            >
              <span className="text-sm text-blue-800 truncate flex-1">
                {lien.hasFichier ? '📎' : '🔗'} {lien.titre}
              </span>
              <button
                type="button"
                onClick={() => toggle(lien.id)}
                className="text-blue-300 hover:text-red-500 text-sm ml-2 flex-shrink-0
                  transition-colors"
                title="Retirer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* UN SEUL bouton d'action qui ouvre un menu */}
      {mode === 'closed' && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('picker')}
            className="flex-1 text-xs py-2 border border-gray-200 rounded-lg
              text-gray-600 hover:bg-gray-50 transition-colors"
          >
            + Lien existant
          </button>
          {ficheId && bloc && (
            <button
              type="button"
              onClick={() => setMode('create')}
              className="flex-1 text-xs py-2 border border-blue-200 rounded-lg
                text-blue-600 hover:bg-blue-50 transition-colors"
            >
              + Nouveau lien
            </button>
          )}
        </div>
      )}

      {/* Picker liens existants */}
      {mode === 'picker' && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-200"
              autoFocus
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {loading && (
              <p className="p-4 text-center text-xs text-gray-400">Chargement...</p>
            )}
            {!loading && filteredLiens.length === 0 && (
              <p className="p-4 text-center text-xs text-gray-400">Aucun lien.</p>
            )}
            {filteredLiens.map((lien) => {
              const isSelected = selectedIds.includes(lien.id)
              return (
                <label
                  key={lien.id}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer
                    border-b border-gray-50 last:border-0 transition-colors
                    ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(lien.id)}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {lien.hasFichier ? '📎' : '🔗'} {lien.titre}
                    </p>
                    {lien.url && (
                      <p className="text-xs text-gray-400 truncate">{lien.url}</p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
          <div className="p-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {selectedIds.length} sélectionné(s)
            </span>
            <button
              type="button"
              onClick={() => setMode('closed')}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg
                hover:bg-blue-700"
            >
              Confirmer
            </button>
          </div>
        </div>
      )}

      {/* Création rapide */}
      {mode === 'create' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-800">Nouveau lien — {titre}</p>
          <input
            type="text"
            value={newTitre}
            onChange={(e) => setNewTitre(e.target.value)}
            placeholder="Titre du lien *"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-200"
            autoFocus
          />
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL (optionnel)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newTitre.trim() || creating}
              className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg
                disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {creating ? 'Création...' : 'Créer et associer'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('closed'); setNewTitre(''); setNewUrl('') }}
              className="text-xs px-3 py-2 border border-gray-200 rounded-lg
                text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
