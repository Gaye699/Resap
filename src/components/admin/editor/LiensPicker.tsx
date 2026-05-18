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
  // ── État mode global ──
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'idle' | 'picker' | 'create'>('idle')

  // ── État création d'un nouveau lien ──
  const [newTitre, setNewTitre] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newType, setNewType] = useState<'url' | 'file'>('url')
  const [newFileAssetId, setNewFileAssetId] = useState('')
  const [newFileName, setNewFileName] = useState('')
  const [creating, setCreating] = useState(false)

  // ── État édition d'un lien existant ──
  const [editingLien, setEditingLien] = useState<string | null>(null)
  const [editTitre, setEditTitre] = useState('')
  const [editType, setEditType] = useState<'url' | 'file'>('url')
  const [editUrl, setEditUrl] = useState('')
  const [editFileAssetId, setEditFileAssetId] = useState('')
  const [editFileName, setEditFileName] = useState('')
  const [saving, setSaving] = useState(false)

  // ── Asset picker partagé ──
  const [showFilePicker, setShowFilePicker] = useState(false)
  // 'edit' = pour l'édition d'un lien, 'create' = pour la création
  const [filePickerTarget, setFilePickerTarget] = useState<'edit' | 'create'>('create')

  const searchInputRef = useRef<HTMLInputElement>(null)

  const { allLiens: contextLiens, setAllLiens, liensLoaded } = useEditor()
  const allLiens = contextLiens as LienItem[]
  const loading = !liensLoaded

  // Focus automatique sur la recherche quand on ouvre le picker
  useEffect(() => {
    if (mode === 'picker' && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [mode])

  // ── Helpers ──

  const toggle = (id: string) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    )

  const refreshLiens = async () => {
    const updated = await listLiens()
    setAllLiens(updated)
  }

  const resetCreateForm = () => {
    setNewTitre('')
    setNewUrl('')
    setNewType('url')
    setNewFileAssetId('')
    setNewFileName('')
  }

  const resetEditForm = () => {
    setEditingLien(null)
    setEditTitre('')
    setEditType('url')
    setEditUrl('')
    setEditFileAssetId('')
    setEditFileName('')
  }

  // ── Ouvrir l'édition d'un lien — pré-remplit les champs ──
  const openEdit = (lien: LienItem) => {
    if (editingLien === lien.id) {
      resetEditForm()
      return
    }
    setEditingLien(lien.id)
    setEditTitre(lien.titre)
    setEditType(lien.hasFichier ? 'file' : 'url')
    setEditUrl(lien.url ?? '')
    setEditFileAssetId('')
    setEditFileName('')
  }

  // ── Créer un nouveau lien ──
  const handleCreate = async () => {
    if (!newTitre.trim()) { toast.error('Titre obligatoire.'); return }
    if (!ficheId || !bloc) { toast.error('Sauvegardez la fiche avant de créer un lien.'); return }
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
      await refreshLiens()
      resetCreateForm()
      setMode('idle')
      toast.success('Lien créé et associé.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur.')
    } finally {
      setCreating(false)
    }
  }

  // ── Enregistrer les modifications d'un lien existant ──
  const handleSaveEdit = async (lienId: string) => {
    if (!editTitre.trim()) { toast.error('Le titre est obligatoire.'); return }
    if (editType === 'url' && !editUrl.trim()) { toast.error('L\'URL est obligatoire.'); return }
    if (editType === 'file' && !editFileAssetId && !allLiens.find(l => l.id === lienId)?.hasFichier) {
      toast.error('Choisissez un fichier.')
      return
    }

    setSaving(true)
    try {
      await updateLienInContentful(lienId, {
        titre: editTitre.trim(),
        url: editType === 'url' ? editUrl.trim() : '',
        fichierAssetId: editType === 'file' && editFileAssetId ? editFileAssetId : undefined,
        clearFichier: editType === 'url',
      })
      await refreshLiens()
      resetEditForm()
      toast.success('Lien mis à jour.')
    } catch {
      toast.error('Erreur lors de la mise à jour du lien.')
    } finally {
      setSaving(false)
    }
  }

  // ── Données calculées ──
  const selectedLiens = selectedIds
    .map((id) => allLiens.find((l) => l.id === id))
    .filter((l): l is LienItem => !!l)

  const filteredLiens = allLiens.filter(
    (l) =>
      l.statut === 'published' &&
      l.titre.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-2">

      {/* ── Liste des liens associés ── */}
      {selectedIds.length > 0 && (
        <div className="space-y-1 mb-2">
          <p className="text-xs text-gray-400 font-medium mb-1">
            {selectedIds.length} lien{selectedIds.length > 1 ? 's' : ''} associé{selectedIds.length > 1 ? 's' : ''} :
          </p>

          {selectedLiens.map((lien) => (
            <div key={lien.id} className="group">

              {/* Ligne du lien — clic = ouvre l'édition */}
              <div
                className="flex items-center justify-between bg-blue-50 border border-blue-100
                  rounded-lg px-3 py-2 hover:bg-blue-100 hover:border-blue-300
                  transition-colors cursor-pointer"
                onClick={() => openEdit(lien)}
                title="Cliquer pour modifier"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-blue-800 truncate block font-medium">
                    {lien.hasFichier ? '📎' : '🔗'} {lien.titre}
                  </span>
                  {lien.url && (
                    <span className="text-xs text-blue-400 truncate block">{lien.url}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ✏️
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggle(lien.id) }}
                    className="text-blue-300 hover:text-red-500 text-sm transition-colors"
                    title="Retirer ce lien"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* ── Formulaire d'édition inline — même structure que la création ── */}
              {editingLien === lien.id && (
                <div className="mt-1 border border-blue-200 rounded-xl bg-white shadow-sm overflow-hidden">

                  {/* En-tête */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                    <p className="text-xs font-semibold text-blue-800">Modifier le lien</p>
                    <button
                      type="button"
                      onClick={resetEditForm}
                      className="text-blue-300 hover:text-blue-600 text-sm transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-3 space-y-2.5">

                    {/* Titre */}
                    <input
                      type="text"
                      value={editTitre}
                      onChange={(e) => setEditTitre(e.target.value)}
                      placeholder="Titre du lien *"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                    />

                    {/* Choix URL / Fichier */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditType('url')}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors
                          ${editType === 'url'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                          }`}
                      >
                        🔗 URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditType('file')}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors
                          ${editType === 'file'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                          }`}
                      >
                        📎 Fichier
                      </button>
                    </div>

                    {/* Champ URL */}
                    {editType === 'url' && (
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                          focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                      />
                    )}

                    {/* Champ fichier */}
                    {editType === 'file' && (
                      <button
                        type="button"
                        onClick={() => { setFilePickerTarget('edit'); setShowFilePicker(true) }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                          text-gray-700 bg-white hover:bg-gray-50 text-left transition-colors"
                      >
                        {editFileName
                          ? `📎 ${editFileName}`
                          : lien.hasFichier
                            ? '📎 Fichier actuel — cliquer pour changer'
                            : '📎 Choisir un fichier *'
                        }
                      </button>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(lien.id)}
                        disabled={saving || !editTitre.trim()}
                        className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg
                          hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button
                        type="button"
                        onClick={resetEditForm}
                        className="text-xs px-3 py-2 border border-gray-200 rounded-lg
                          text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedIds.length === 0 && (
        <p className="text-xs text-gray-400 italic mb-2">Aucun lien associé.</p>
      )}

      {/* ── Boutons d'action ── */}
      {mode === 'idle' && (
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

      {/* ── Picker : sélectionner des liens existants ── */}
      {mode === 'picker' && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-600">Sélectionner des liens</p>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="text-gray-400 hover:text-gray-700 text-sm w-6 h-6
                flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
              title="Fermer"
            >
              ✕
            </button>
          </div>

          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading && (
              <p className="p-4 text-center text-xs text-gray-400">Chargement...</p>
            )}
            {!loading && filteredLiens.length === 0 && (
              <p className="p-4 text-center text-xs text-gray-400">Aucun lien publié trouvé.</p>
            )}
            {filteredLiens.map((lien) => {
              const isSelected = selectedIds.includes(lien.id)
              return (
                <label
                  key={lien.id}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer
                    border-b border-gray-50 last:border-0 transition-colors
                    ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(lien.id)}
                    className="w-4 h-4 rounded border-gray-300 flex-shrink-0"
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

          <div className="p-2 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg
                hover:bg-blue-700 transition-colors"
            >
              Confirmer
            </button>
          </div>
        </div>
      )}

      {/* ── Formulaire de création d'un nouveau lien ── */}
      {mode === 'create' && (
        <div className="border border-blue-200 rounded-xl bg-white shadow-sm overflow-hidden">

          {/* En-tête */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-b border-blue-100">
            <p className="text-xs font-semibold text-blue-800">
              Nouveau lien — {titre}
            </p>
            <button
              type="button"
              onClick={() => { setMode('idle'); resetCreateForm() }}
              className="text-blue-300 hover:text-blue-600 text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-3 space-y-2.5">

            {/* Titre */}
            <input
              type="text"
              value={newTitre}
              onChange={(e) => setNewTitre(e.target.value)}
              placeholder="Titre du lien *"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            />

            {/* Choix URL / Fichier */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewType('url')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors
                  ${newType === 'url'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                  }`}
              >
                🔗 URL
              </button>
              <button
                type="button"
                onClick={() => setNewType('file')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors
                  ${newType === 'file'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                  }`}
              >
                📂Fichier
              </button>
            </div>

            {/* Champ URL */}
            {newType === 'url' && (
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              />
            )}

            {/* Champ fichier */}
            {newType === 'file' && (
              <button
                type="button"
                onClick={() => { setFilePickerTarget('create'); setShowFilePicker(true) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                  text-gray-700 bg-white hover:bg-gray-50 text-left transition-colors"
              >
                {newFileName ? `📎 ${newFileName}` : '📎 Choisir un fichier *'}
              </button>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
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
                onClick={() => { setMode('idle'); resetCreateForm() }}
                className="text-xs px-3 py-2 border border-gray-200 rounded-lg
                  text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Asset picker partagé ── */}
      {showFilePicker && (
        <AssetPicker
          mode="embed"
          onSelect={(asset) => {
            if (filePickerTarget === 'edit') {
              // Mise à jour du state d'édition — l'enregistrement se fait au clic "Enregistrer"
              setEditFileAssetId(asset.id)
              setEditFileName(asset.titre || asset.fileName || 'Fichier sélectionné')
            } else {
              // Création d'un nouveau lien
              setNewFileAssetId(asset.id)
              setNewFileName(asset.titre || asset.fileName || 'Fichier sélectionné')
            }
            setShowFilePicker(false)
          }}
          onClose={() => setShowFilePicker(false)}
        />
      )}
    </div>
  )
}
