'use client'

import { useState, useCallback, useEffect, ChangeEvent } from 'react'
import { listAssets, uploadAssetToContentful } from '@/services/contentful-management'
import toast from 'react-hot-toast'

type Asset = { id: string; titre: string; url: string; contentType: string; fileName: string }
type FilterType = 'all' | 'image' | 'pdf' | 'other'
type SortBy = 'name' | 'type'

type Props = {
  mode: 'illustration' | 'embed'
  currentAssetUrl?: string
  onSelect: (asset: Asset) => void
  onClose: () => void
}

const PAGE_SIZE = 24

export function AssetPicker({ mode, currentAssetUrl, onSelect, onClose }: Props) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'existing' | 'upload'>(mode === 'embed' ? 'upload' : 'existing')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortBy>('name')

  const load = useCallback(async (q?: string, p = 0) => {
    setLoading(true)
    try {
      const data = await listAssets(q, p * PAGE_SIZE, PAGE_SIZE)
      setAssets(data.items)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [])

  // Chargement automatique dès l'ouverture de l'onglet existants
  useEffect(() => {
    if (tab === 'existing') load(search || undefined, page)
  }, [tab, page, load])

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(0)
    load(v || undefined, 0)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { id, url } = await uploadAssetToContentful(file, file.name.replace(/\.[^.]+$/, ''))
      onSelect({ id, titre: file.name, url, contentType: file.type, fileName: file.name })
    } catch (err) {
      toast.error(err instanceof Error ? `Erreur upload : ${err.message}` : 'Erreur lors de l\'upload.')
    } finally {
      setUploading(false)
    }
    e.target.value = ''
  }

  const filtered = assets
    .filter((a) => {
      if (mode === 'illustration' && !a.contentType.startsWith('image/') && !a.contentType.includes('svg')) return false
      if (filterType === 'image') return a.contentType.startsWith('image/')
      if (filterType === 'pdf') return a.contentType.includes('pdf')
      if (filterType === 'other') return !a.contentType.startsWith('image/') && !a.contentType.includes('pdf')
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'type') return a.contentType.localeCompare(b.contentType)
      return (a.titre || a.fileName).localeCompare(b.titre || b.fileName)
    })

  // Compteurs par type
  const counts = {
    all: assets.length,
    image: assets.filter(a => a.contentType.startsWith('image/')).length,
    pdf: assets.filter(a => a.contentType.includes('pdf')).length,
    other: assets.filter(a => !a.contentType.startsWith('image/') && !a.contentType.includes('pdf')).length,
  }

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-[720px] max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="m-0 text-base font-semibold text-gray-900">
              {mode === 'illustration' ? 'Choisir une illustration' : 'Insérer un asset'}
            </h2>
            {!loading && (
              <p className="text-xs text-gray-400 mt-0.5">{total} asset{total > 1 ? 's' : ''} au total</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="bg-transparent border-none text-lg cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { key: 'existing', label: '📁 Assets existants', onClick: () => setTab('existing') },
            { key: 'upload', label: '⬆️ Uploader', onClick: () => setTab('upload') },
          ].map(({ key, label, onClick }) => (
            <button
              type="button"
              key={key}
              onClick={onClick}
              className={`px-4 py-2.5 text-[13px] border-none cursor-pointer transition-all border-b-2
                ${tab === key ? 'bg-blue-50 text-blue-600 border-blue-600 font-medium' : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {tab === 'existing' && (
            <>
              {/* Barre de recherche + filtres */}
              <div className="px-4 py-3 border-b border-gray-100 space-y-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Rechercher un asset par titre..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-[7px] text-[13px] outline-none focus:border-blue-500 transition-colors"
                />
                {/* Filtres type */}
                <div className="flex items-center gap-2 flex-wrap">
                  {(['all', 'image', 'pdf', 'other'] as FilterType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFilterType(type)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors
                        ${filterType === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                        }`}
                    >
                      {type === 'all' ? `Tous (${counts.all})` :
                       type === 'image' ? `🖼 Images (${counts.image})` :
                       type === 'pdf' ? `📄 PDF (${counts.pdf})` :
                       `📎 Autres (${counts.other})`}
                    </button>
                  ))}

                  {/* Tri */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="ml-auto text-[11px] border border-gray-200 rounded-lg px-2 py-1 text-gray-500 outline-none"
                  >
                    <option value="name">Trier par nom</option>
                    <option value="type">Trier par type</option>
                  </select>
                </div>
              </div>

              {/* Zone unique de la grille — hauteur fixe pour éviter le saut graphique */}
              <div className="flex-1 overflow-y-auto p-3" style={{ minHeight: 320 }}>

                {/* 1. État : Chargement en cours */}
                {loading && (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="border-2 border-gray-100 rounded-lg overflow-hidden animate-pulse">
                        <div className="h-[90px] bg-gray-100" />
                        <div className="p-2 space-y-1">
                          <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                          <div className="h-2 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. État : Aucun résultat après chargement */}
                {!loading && filtered.length === 0 && (
                  <div className="flex items-center justify-center h-full" style={{ minHeight: 280 }}>
                    <p className="text-center text-[13px] text-gray-400">Aucun asset trouvé.</p>
                  </div>
                )}

                {/* 3. État : Liste des résultats disponibles */}
                {!loading && filtered.length > 0 && (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5">
                    {filtered.map((asset) => (
                      <button
                        type="button"
                        key={asset.id}
                        onClick={() => onSelect(asset)}
                        className={`overflow-hidden rounded-lg border-2 bg-white p-0 text-left transition-colors hover:border-blue-500
                          ${currentAssetUrl === asset.url ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
                          cursor-pointer`}
                      >
                        <div className="flex h-[90px] items-center justify-center overflow-hidden bg-gray-50">
                          {asset.contentType.startsWith('image/') && asset.url ? (
                            <img src={asset.url} alt={asset.titre} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-3xl">
                              {asset.contentType.includes('pdf') ? '📄' : '📎'}
                            </span>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="m-0 truncate text-[11px] font-medium text-gray-700">
                            {asset.titre || asset.fileName}
                          </p>
                          <p className="mb-0 mt-0.5 text-[10px] text-gray-400">
                            {asset.contentType.split('/')[1]?.toUpperCase()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
                  <span className="text-xs text-gray-400">
                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} sur {total} assets
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                    >
                      ← Précédent
                    </button>
                    <span className="px-3 py-1.5 text-xs text-gray-500">
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => p + 1)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                    >
                      Suivant →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'upload' && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-[48px] mb-4">⬆️</div>
                <p className="text-sm text-gray-700 mb-2">
                  {mode === 'illustration' ? 'Choisissez une image (PNG, JPG, SVG...)' : 'Choisissez un fichier à uploader'}
                </p>
                <p className="text-[12px] text-gray-400 mb-5">Uploadé dans Contentful Media et sélectionné automatiquement.</p>
                <label className={`inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium transition-all
                  ${uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-blue-700'}`}
                >
                  {uploading ? '⏳ Upload en cours...' : '📁 Choisir un fichier'}
                  <input
                    type="file"
                    accept={mode === 'illustration' ? 'image/*,.svg' : 'image/*,.svg,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv'}
                    onChange={handleUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
