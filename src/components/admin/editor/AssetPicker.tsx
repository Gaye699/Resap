'use client'

import { useState, useCallback, ChangeEvent } from 'react'
import { listAssets, uploadAssetToContentful } from '@/services/contentful-management'

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
      alert('Erreur lors de l\'upload : ' + (err instanceof Error ? err.message : 'inconnu'))
    } finally {
      setUploading(false)
    }

    e.target.value = ''
  }

  // Filtre par type selon le mode
  const filtered = mode === 'illustration'
    ? assets.filter((a) => a.contentType.startsWith('image/'))
    : assets

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          width: '100%', maxWidth: 680,
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>
            {mode === 'illustration' ? 'Choisir une illustration' : 'Insérer un asset'}
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
          {[
            { key: 'existing', label: '📁 Assets existants', onClick: handleTabExisting },
            { key: 'upload', label: '⬆️ Uploader un fichier', onClick: () => setTab('upload') },
          ].map(({ key, label, onClick }) => (
            <button
                type="button"
              key={key}
              onClick={onClick}
              style={{
                padding: '10px 16px',
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
                background: tab === key ? '#eff6ff' : 'transparent',
                color: tab === key ? '#2563eb' : '#6b7280',
                borderBottom: tab === key ? '2px solid #2563eb' : '2px solid transparent',
                fontWeight: tab === key ? 500 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Corps */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Onglet : assets existants */}
          {tab === 'existing' && (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f9fafb' }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Rechercher un asset par titre..."
                  style={{
                    width: '100%',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: '7px 12px',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {loading && (
                  <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 20 }}>Chargement...</p>
                )}

                {!loading && filtered.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 20 }}>
                    Aucun asset trouvé.
                  </p>
                )}

                {/* Grille d'assets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                  {filtered.map((asset) => (
                    <button
                    type="button"
                      key={asset.id}
                      onClick={() => onSelect(asset)}
                      style={{
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        background: 'white',
                        cursor: 'pointer',
                        padding: 0,
                        overflow: 'hidden',
                        textAlign: 'left',
                        transition: 'border-color 0.1s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb' }}
                    >
                      {/* Aperçu */}
                      <div style={{ height: 90, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {asset.contentType.startsWith('image/') ? (
                          <img src={asset.url} alt={asset.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: 32 }}>
                            {asset.contentType.includes('pdf') ? '📄' : '📎'}
                          </span>
                        )}
                      </div>
                      {/* Infos */}
                      <div style={{ padding: '6px 8px' }}>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {asset.titre || asset.fileName}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 10, color: '#9ca3af' }}>
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
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⬆️</div>
                <p style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>
                  {mode === 'illustration'
                    ? 'Choisissez une image à uploader (PNG, JPG, SVG...)'
                    : 'Choisissez un fichier à uploader (image, PDF, doc...)'}
                </p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
                  Le fichier sera uploadé dans Contentful Media et automatiquement sélectionné.
                </p>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: 'white',
                  borderRadius: 8,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  opacity: uploading ? 0.6 : 1,
                }}
                >
                  {uploading ? '⏳ Upload en cours...' : '📁 Choisir un fichier'}
                  <input
                    type="file"
                    accept={mode === 'illustration' ? 'image/*' : '*/*'}
                    onChange={handleUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
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
