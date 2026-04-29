'use client'

import { useState, useCallback, ChangeEvent } from 'react'
import { listAssets, uploadAssetToContentful } from '@/services/contentful-management'
import toast from 'react-hot-toast'

type Asset = { id: string; titre: string; url: string; contentType: string; fileName: string }

type Props = {
  // 'illustration' = sélection unique + aperçu
  // 'embed' = sélection pour insertion dans le rich text
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
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState<'existing' | 'upload'>('existing')

  const load = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const data = await listAssets(q)
      setAssets(data)
      setLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (v: string) => {
    setSearch(v)
    if (v.length > 1 || v === '') load(v || undefined)
  }

  // Appelé au premier affichage de l'onglet "Existant"
  const handleTabExisting = () => {
    setTab('existing')
    if (!loaded) load()
  }

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const { id, url } = await uploadAssetToContentful(file, file.name.replace(/\.[^.]+$/, ''))
      onSelect({ id, titre: file.name, url, contentType: file.type, fileName: file.name })
    } catch (err) {
      toast.error(err instanceof Error
        ? `Erreur lors de l'upload : ${err.message}`
        : 'Erreur lors de l\'upload.')
    } finally {
      setUploading(false)
    }

    e.target.value = ''
  }

  // Filtre par type selon le mode
 const filtered = mode === 'illustration'
  ? assets.filter((a) =>
      a.contentType.startsWith('image/') ||
      a.contentType.includes('svg')
    )
  : assets

  const isCurrentAsset = (asset: Asset) => {
    return currentAssetUrl && asset.url === currentAssetUrl
  }

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-[680px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="m-0 text-base font-semibold text-gray-900">
            {mode === 'illustration' ? 'Choisir une illustration' : 'Insérer un asset'}
          </h2>
          <button type="button" onClick={onClose} className="bg-transparent border-none text-lg cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { key: 'existing', label: '📁 Assets existants', onClick: handleTabExisting },
            { key: 'upload', label: '⬆️ Uploader un fichier', onClick: () => setTab('upload') },
          ].map(({ key, label, onClick }) => (
            <button
              type="button"
              key={key}
              onClick={onClick}
              className={`
                px-4 py-2.5 text-[13px] border-none cursor-pointer transition-all border-b-2
                ${tab === key
                  ? 'bg-blue-50 text-blue-600 border-blue-600 font-medium'
                  : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* Onglet : assets existants */}
          {tab === 'existing' && (
            <>
              <div className="px-4 py-3 border-b border-gray-50">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Rechercher un asset par titre..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-[7px] text-[13px] outline-none focus:border-blue-500 transition-colors box-border"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {loading && (
                  <p className="text-center text-gray-400 text-[13px] p-5">Chargement...</p>
                )}

                {!loading && filtered.length === 0 && (
                  <p className="text-center text-gray-400 text-[13px] p-5">
                    Aucun asset trouvé.
                  </p>
                )}

                {/* Grille d'assets */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5">
                  {filtered.map((asset) => (
                    <button
                      type="button"
                      key={asset.id}
                      onClick={() => onSelect(asset)}
                      className="border-2 border-gray-200 rounded-lg bg-white cursor-pointer p-0 overflow-hidden text-left transition-colors hover:border-blue-500"
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb' }}
                    >
                      {/* Aperçu */}
                      <div className="h-[90px] bg-gray-50 flex items-center justify-center overflow-hidden">
                      {asset.contentType.startsWith('image/') && asset.url ? (
                          <img
                            src={asset.url}
                            alt={asset.titre}
                            className="w-full h-full object-cover"
                          />
                      ) : (
                        <div className="text-center">
                          <span className="text-3xl">
                            {asset.contentType.includes('pdf') ? '📄' : '📎'}
                          </span>
                        </div>
                      )}
                    </div>
                      {/* Infos */}
                      <div className="p-2">
                        <p className="m-0 text-[11px] font-medium text-gray-700 truncate">
                          {asset.titre || asset.fileName}
                        </p>
                        <p className="mt-0.5 mb-0 text-[10px] text-gray-400">
                          {asset.contentType.split('/')[1]?.toUpperCase()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Onglet : upload */}
          {tab === 'upload' && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-[48px] mb-4">⬆️</div>
                <p className="text-sm text-gray-700 mb-2">
                  {mode === 'illustration'
                    ? 'Choisissez une image à uploader (PNG, JPG, SVG...)'
                    : 'Choisissez un fichier à uploader (image, PDF, doc...)'}
                </p>
                <p className="text-[12px] text-gray-400 mb-5">
                  Le fichier sera uploadé dans Contentful Media et automatiquement sélectionné.
                </p>
                <label
                  className={`
                    inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg 
                    text-sm font-medium transition-all
                    ${uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-blue-700'}
                  `}
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
