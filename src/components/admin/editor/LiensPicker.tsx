'use client'

import { useRef, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { createLienAndLinkToFiche, listLiens, updateLienInContentful } from '@/services/contentful-management'
import { useEditor } from './EditorContext'
import { AssetPicker } from './AssetPicker'

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
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'idle' | 'picker' | 'create'>('idle')
  const [newTitre, setNewTitre] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newType, setNewType] = useState<'url' | 'file'>('url')
  const [newFileAssetId, setNewFileAssetId] = useState('')
  const [newFileName, setNewFileName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showFilePicker, setShowFilePicker] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  const { allLiens: contextLiens, setAllLiens, liensLoaded } = useEditor()
  const allLiens = contextLiens as LienItem[]
  const loading = !liensLoaded

  useEffect(() => {
    if (mode === 'picker' && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [mode])

  const toggle = (id: string) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    )

  const handleUpdateLien = async (lienId: string, data: { titre?: string; url?: string }) => {
    try {
      await updateLienInContentful(lienId, data)
      const updated = await listLiens()
      setAllLiens(updated)
    } catch {
      toast.error('Erreur lors de la mise a jour du lien.')
    }
  }

  const resetCreateForm = () => {
    setNewTitre('')
    setNewUrl('')
    setNewType('url')
    setNewFileAssetId('')
    setNewFileName('')
    setShowFilePicker(false)
  }

  const handleCreate = async () => {
    if (!newTitre.trim()) { toast.error('Titre obligatoire.'); return }
    if (!ficheId || !bloc) { toast.error('Sauvegardez la fiche avant de creer un lien.'); return }
    if (newType === 'url' && !newUrl.trim()) { toast.error('URL obligatoire pour un lien URL.'); return }
    if (newType === 'file' && !newFileAssetId) { toast.error('Choisissez un fichier.'); return }

    setCreating(true)
    try {
      const { id } = await createLienAndLinkToFiche(ficheId, bloc, {
        titre: newTitre.trim(),
        url: newType === 'url' ? (newUrl.trim() || undefined) : undefined,
        fichierAssetId: newType === 'file' ? newFileAssetId : undefined,
      })
      onChange([...selectedIds, id])
      const updated = await listLiens()
      setAllLiens(updated)
      resetCreateForm()
      setMode('idle')
      toast.success('Lien cree et associe.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur.')
    } finally {
      setCreating(false)
    }
  }

  const selectedLiens = selectedIds
    .map((id) => allLiens.find((l) => l.id === id))
    .filter((l): l is LienItem => !!l)

  const filteredLiens = allLiens.filter((l) => l.statut === 'published' && l.titre.toLowerCase().includes(search.toLowerCase()))

  const [editingLien, setEditingLien] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {selectedIds.length > 0 && (
        <div className="space-y-1 mb-2">
          <p className="text-xs text-gray-400 font-medium mb-1">
            {selectedIds.length} lien(s) associe(s) :
          </p>
          {selectedLiens.map((lien) => (
            <div key={lien.id} className="group relative">
              <div
                className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => setEditingLien(lien.id === editingLien ? null : lien.id)}
                title="Cliquer pour modifier"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-blue-800 truncate block font-medium">
                    {lien.hasFichier ? '[FILE]' : '[URL]'} {lien.titre}
                  </span>
                  {lien.url && (
                    <span className="text-xs text-blue-400 truncate block">{lien.url}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"> ✏️ </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggle(lien.id) }}
                    className="text-blue-300 hover:text-red-500 text-sm transition-colors"
                    title="Retirer ce lien"
                  >
                    ❌
                  </button>
                </div>
              </div>

              {editingLien === lien.id && (
                <div className="mt-1 p-3 bg-white border border-blue-200 rounded-lg shadow-sm space-y-2">
                  <input
                    type="text"
                    defaultValue={lien.titre}
                    placeholder="Titre"
                    onBlur={(e) => handleUpdateLien(lien.id, { titre: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    type="url"
                    defaultValue={lien.url ?? ''}
                    placeholder="URL (optionnel)"
                    onBlur={(e) => handleUpdateLien(lien.id, { url: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedIds.length === 0 && (
        <p className="text-xs text-gray-400 italic mb-2">Aucun lien associe.</p>
      )}

      {mode === 'idle' && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setMode('picker') }}
            className="flex-1 text-xs py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            + Lien existant
          </button>
          {ficheId && bloc && (
            <button
              type="button"
              onClick={() => setMode('create')}
              className="flex-1 text-xs py-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
            >
              + Nouveau lien
            </button>
          )}
        </div>
      )}

      {mode === 'picker' && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-600">
              Selectionner des liens
            </p>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="text-gray-400 hover:text-gray-700 text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
              title="Fermer"
            >
              ❌
            </button>
          </div>
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
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
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(lien.id)}
                    className="w-4 h-4 rounded border-gray-300 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {lien.hasFichier ? '[FILE]' : '[URL]'} {lien.titre}
                    </p>
                    {lien.url && (
                      <p className="text-xs text-gray-400 truncate">{lien.url}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${lien.statut === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {lien.statut === 'published' ? 'Pub.' : 'Draft'}
                  </span>
                </label>
              )
            })}
          </div>
          <div className="p-2 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {selectedIds.length} selectionne(s)
            </span>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirmer
            </button>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-blue-800">
              Nouveau lien - {titre}
            </p>
            <button
              type="button"
              onClick={() => { setMode('idle'); resetCreateForm() }}
              className="text-blue-300 hover:text-blue-600 text-sm"
            >
              ?
            </button>
          </div>
          <input
            type="text"
            value={newTitre}
            onChange={(e) => setNewTitre(e.target.value)}
            placeholder="Titre du lien *"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNewType('url')}
              className={`text-xs px-3 py-1.5 rounded-lg border ${newType === 'url' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 bg-white'}`}
            >
              URL
            </button>
            <button
              type="button"
              onClick={() => setNewType('file')}
              className={`text-xs px-3 py-1.5 rounded-lg border ${newType === 'file' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 bg-white'}`}
            >
              Fichier
            </button>
          </div>

          {newType === 'url' && (
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="URL *"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            />
          )}

          {newType === 'file' && (
            <button
              type="button"
              onClick={() => setShowFilePicker(true)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 text-left"
            >
              {newFileName ? `Fichier: ${newFileName}` : 'Choisir un fichier *'}
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newTitre.trim() || creating}
              className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {creating ? 'Creation...' : 'Creer et associer'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('idle'); resetCreateForm() }}
              className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {showFilePicker && (
        <AssetPicker
          mode="embed"
          onSelect={(asset) => {
            setNewFileAssetId(asset.id)
            setNewFileName(asset.titre || asset.fileName || asset.url)
            setShowFilePicker(false)
          }}
          onClose={() => setShowFilePicker(false)}
        />
      )}
    </div>
  )
}


