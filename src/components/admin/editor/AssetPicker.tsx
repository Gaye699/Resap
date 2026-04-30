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

export function AssetPicker({ mode, currentAssetUrl, onSelect, onClose }: Props) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'existing' | 'upload'>(mode === 'embed' ? 'upload' : 'existing')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortBy>('name')

  const load = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const data = await listAssets(q)
      setAssets(data)
    } finally {
      setLoading(false)
    }
  }, [])

  // Chargement automatique dès l'ouverture de l'onglet existants
  useEffect(() => {
    if (tab === 'existing') load()
  }, [tab, load])

  const handleSearch = (v: string) => {
    setSearch(v)
    if (v.length > 1 || v === '') load(v || undefined)
  }

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

  const getTypeLabel = (contentType: string) => {
    if (contentType.startsWith('image/')) return 'image'
    if (contentType.includes('pdf')) return 'pdf'
    return 'other'
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
              <p className="text-xs text-gray-400 mt-0.5">{assets.length} asset{assets.length > 1 ? 's' : ''} dans Contentful</p>
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
            >{label}
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

              <div className="relative flex-1 overflow-y-auto p-3">
                {loading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/85 backdrop-blur-[1px]">
                    <p className="text-center text-[13px] text-gray-400">Chargement des assets...</p>
                  </div>
                )}

                {!loading && filtered.length === 0 && (
                  <p className="p-5 text-center text-[13px] text-gray-400">Aucun asset trouvé.</p>
                )}

                <div className={`grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5 ${loading ? 'pointer-events-none opacity-40' : ''}`}>
                  {filtered.map((asset) => (
                    <button
                      type="button"
                      key={asset.id}
                      onClick={() => onSelect(asset)}
                      disabled={loading}
                      className={`overflow-hidden rounded-lg border-2 bg-white p-0 text-left transition-colors hover:border-blue-500
                        ${currentAssetUrl === asset.url ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
                        ${loading ? 'cursor-wait' : 'cursor-pointer'}`}
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
                        <p className="m-0 truncate text-[11px] font-medium text-gray-700">{asset.titre || asset.fileName}</p>
                        <p className="mb-0 mt-0.5 text-[10px] text-gray-400">{asset.contentType.split('/')[1]?.toUpperCase()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
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
                  ${uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-blue-700'}`}>
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
