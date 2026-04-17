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
  // Si ficheId + bloc sont fournis → permet la création rapide
  ficheId?: string
  bloc?: 'outils' | 'patients' | 'pourEnSavoirPlus'
}

export function LiensPicker({ titre, selectedIds, onChange, ficheId, bloc }: Props) {
  const [allLiens, setAllLiens] = useState<LienItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  // Mode création rapide
  const [showCreate, setShowCreate] = useState(false)
  const [newTitre, setNewTitre] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [creating, setCreating] = useState(false)

  const load = async () => {
    if (allLiens.length > 0) return
    setLoading(true)
    try {
      setAllLiens(await listLiens())
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    load()
  }

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    )
  }

  // Création rapide d'un nouveau lien depuis le formulaire fiche
  const handleCreateLien = async () => {
    if (!newTitre.trim()) return
    if (!ficheId || !bloc) {
      // Sans ficheId, on crée juste le lien et on l'ajoute à la sélection
      toast.error('Sauvegardez la fiche d\'abord pour créer des liens.')
      return
    }

    setCreating(true)
    try {
      const { id } = await createLienAndLinkToFiche(ficheId, bloc, {
        titre: newTitre.trim(),
        url: newUrl.trim() || undefined,
      })
      // Ajoute le nouveau lien à la sélection locale
      onChange([...selectedIds, id])
      // Rafraîchit la liste
      const updated = await listLiens()
      setAllLiens(updated)
      setNewTitre('')
      setNewUrl('')
      setShowCreate(false)
      toast.success('Lien créé et associé à la fiche.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur lors de la création du lien.')
    } finally {
      setCreating(false)
    }
  }

  const filteredLiens = allLiens.filter((l) =>
    l.titre.toLowerCase().includes(search.toLowerCase()),
  )

  // Labels des liens sélectionnés pour l'affichage
  const selectedLiens = selectedIds
    .map((id) => allLiens.find((l) => l.id === id))
    .filter(Boolean) as LienItem[]

  return (
    <div>
      {/* Liens actuellement sélectionnés */}
      {selectedIds.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {selectedLiens.map((lien) => (
            <div
              key={lien.id}
              className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{lien.hasFichier ? '📎' : '🔗'}</span>
                <span className="text-sm text-blue-800 font-medium truncate">{lien.titre}</span>
                {lien.url && (
                  <span className="text-xs text-blue-400 truncate hidden sm:block">{lien.url}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => toggle(lien.id)}
                className="text-blue-300 hover:text-blue-600 text-sm ml-2 flex-shrink-0"
                title="Retirer ce lien"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleOpen}
          className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          + Sélectionner un lien existant
        </button>
        {ficheId && bloc && (
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="text-xs px-3 py-1.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          >
            + Créer un nouveau lien
          </button>
        )}
      </div>

      {/* Formulaire de création rapide */}
      {showCreate && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-800">Nouveau lien — {titre}</p>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newTitre}
              onChange={(e) => setNewTitre(e.target.value)}
              placeholder="Ex : Guide AME 2024"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">URL (optionnel)</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreateLien}
              disabled={!newTitre.trim() || creating}
              className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {creating ? 'Création...' : 'Créer et associer'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setNewTitre(''); setNewUrl('') }}
              className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Picker liens existants */}
      {isOpen && (
        <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {/* Recherche */}
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un lien..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Liste */}
          <div className="max-h-56 overflow-y-auto">
            {loading && (
              <p className="p-4 text-center text-xs text-gray-400">Chargement...</p>
            )}
            {!loading && filteredLiens.length === 0 && (
              <p className="p-4 text-center text-xs text-gray-400">Aucun lien trouvé.</p>
            )}
            {filteredLiens.map((lien) => {
              const isSelected = selectedIds.includes(lien.id)
              return (
                <label
                  key={lien.id}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(lien.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {lien.hasFichier ? '📎' : '🔗'} {lien.titre}
                    </p>
                    {lien.url && (
                      <p className="text-xs text-gray-400 truncate">{lien.url}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    lien.statut === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                  >
                    {lien.statut === 'published' ? 'Publié' : 'Draft'}
                  </span>
                </label>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Confirmer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
