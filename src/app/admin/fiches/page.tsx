'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  listFiches,
  deleteFiche,
  publishFiche,
} from '@/services/contentful-management'
import { ActionMenu } from '@/components/admin/ActionMenu'
import { BulkBar } from '@/components/admin/BulkBar'
import { useTableFilters } from '@/hooks/useTableFilters'

type Fiche = Awaited<ReturnType<typeof listFiches>>[number]

// Couleurs de catégorie identiques au site live
const CATEGORIE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  sante: { bg: '#e8f5e9', text: '#2e7d32', label: 'Accès à la santé' },
  'besoins-primaires': { bg: '#fff3e0', text: '#e65100', label: 'Besoins Primaires' },
  social: { bg: '#e3f2fd', text: '#1565c0', label: 'Social' },
  interpretariat: { bg: '#f3e5f5', text: '#6a1b9a', label: 'Interprétariat' },
}

// Vues disponibles : grille (comme le site) ou tableau
type View = 'grid' | 'table'

export default function AdminFichesPage() {
  const router = useRouter()
  const [data, setData] = useState<Fiche[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [view, setView] = useState<View>('table')

  const charger = async () => {
    setLoading(true)
    try {
      setData(await listFiches())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { charger() }, [])

  const {
    search, setSearch,
    filters, setFilter,
    sortKey, sortDir, toggleSort,
    filtered,
    paginated,
    page,
    setPage, pageSize, setPageSize,
    totalPages,
    selectedIds, toggleSelect, toggleSelectAll, clearSelection,
  } = useTableFilters<Fiche>({
    data,
    searchFields: ['titre', 'slug', 'categorie'],
    defaultSortKey: 'updatedAt',
    defaultSortDir: 'desc',
  })

  const handleDeleteOne = async (id: string) => {
    if (!window.confirm('Supprimer cette fiche définitivement ?')) return
    try {
      await deleteFiche(id)
      toast.success('Fiche supprimée.')
      charger()
    } catch { toast.error('Erreur.') }
  }

  const handlePublishOne = async (id: string) => {
    try {
      await publishFiche(id)
      toast.success('Fiche publiée.')
      charger()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur.')
    }
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Supprimer ${selectedIds.size} fiche(s) définitivement ?`)) return
    setIsProcessing(true)
    try {
      await Promise.all([...selectedIds].map(deleteFiche))
      toast.success(`${selectedIds.size} fiche(s) supprimée(s).`)
      clearSelection(); charger()
    } catch {
      toast.error('Erreur.')
    } finally { setIsProcessing(false) }
  }

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>

  const allFilteredIds = filtered.map((f) => f.id)

  return (
    <div className="p-6">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fiches pratiques</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length !== data.length
              ? `${filtered.length} sur ${data.length} fiches`
              : `${data.length} fiche${data.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle vue grille/tableau */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`px-3 py-2 text-sm ${view === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              ⊞ Grille
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              className={`px-3 py-2 text-sm border-l border-gray-200 ${view === 'table' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              ☰ Liste
            </button>
          </div>
          <Link
            href="/admin/fiches/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            + Nouvelle fiche
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-56">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, slug..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <select
          value={filters.statut ?? ''}
          onChange={(e) => setFilter('statut', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Statut (tous)</option>
          <option value="published">Publié</option>
          <option value="draft">Brouillon</option>
        </select>

        <select
          value={filters.categorie ?? ''}
          onChange={(e) => setFilter('categorie', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Catégorie (toutes)</option>
          {Object.entries(CATEGORIE_COLORS).map(([val, { label }]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {/* Sélectionner tout (vue grille) */}
        {view === 'grid' && (
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id))}
              onChange={() => toggleSelectAll(allFilteredIds)}
              className="w-4 h-4 rounded"
            />
            Tout sélectionner
          </label>
        )}

        {(search || Object.values(filters).some(Boolean)) && (
          <button
            type="button"
            onClick={() => { setSearch(''); setFilter('statut', ''); setFilter('categorie', '') }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ✕ Reset
          </button>
        )}
      </div>

      {/* ── VUE GRILLE (identique au site live) ── */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((fiche) => {
            const cat = CATEGORIE_COLORS[fiche.categorie] ?? CATEGORIE_COLORS.sante
            const isSelected = selectedIds.has(fiche.id)

            return (
              <div
                key={fiche.id}
                className={`bg-white rounded-xl border-2 transition-all ${
                  isSelected ? 'border-blue-400 shadow-md' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                }`}
                style={{ position: 'relative' }}
              >
                {/* Checkbox sélection */}
                <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(fiche.id)}
                    className="w-4 h-4 rounded border-gray-300 bg-white shadow"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Menu actions */}
                <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                  <ActionMenu
                    actions={[
                    {
                      label: 'Éditeur visuel',
                      icon: '✏️',
                      onClick: () => router.push(`/admin/fiches/${fiche.id}/editor`),
                    },
                    {
                      label: 'Modifier',
                      icon: '📝',
                      onClick: () => router.push(`/admin/fiches/${fiche.id}/modifier`),
                    },
                    {
                      label: fiche.statut === 'published' ? 'Dépublier' : 'Publier',
                      icon: fiche.statut === 'published' ? '○' : '●',
                      onClick: () => handlePublishOne(fiche.id),
                    },
                    {
                      label: 'Voir sur le site',
                      icon: '↗',
                      onClick: () => window.open(`https://www.resap.fr/fiches/${fiche.categorie}/${fiche.slug}`, '_blank'),
                    },
                    {
                      label: 'Supprimer',
                      icon: '🗑',
                      variant: 'danger',
                      divider: true,
                      onClick: () => handleDeleteOne(fiche.id),
                    },
                  ]}
                  />
                </div>

                {/* Illustration (si disponible) */}
                <div
                  className="rounded-t-xl overflow-hidden"
                  style={{
                    height: 120,
                    background: cat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {fiche.illustrationUrl ? (
                    <img
                      src={fiche.illustrationUrl}
                      alt={fiche.titre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    )
                    : (
                      <span style={{ fontSize: 40, opacity: 0.3 }}>📄</span>
                    )}
                </div>

                {/* Contenu */}
                <div className="p-4">
                  {/* Badge catégorie */}
                  <span
                    className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
                    style={{ background: cat.bg, color: cat.text }}
                  >
                    {cat.label}
                  </span>

                  {/* Titre */}
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">
                    {fiche.titre}
                  </h3>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      fiche.statut === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                    >
                      {fiche.statut === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(fiche.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── VUE TABLEAU ── */}
      {view === 'table' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="pl-4 pr-2 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredIds.every((id) => selectedIds.has(id))}
                    onChange={() => toggleSelectAll(allFilteredIds)}
                    className="w-4 h-4 rounded border-gray-300"
                    aria-label="Sélectionner tout"
                  />
                </th>
                {[
                  { key: 'titre', label: 'Titre' },
                  { key: 'categorie', label: 'Catégorie' },
                  { key: 'statut', label: 'Statut' },
                  { key: 'updatedAt', label: 'Modifié' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key as keyof Fiche)}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {sortKey === key
                        ? <span style={{ color: '#3b82f6', fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                        : <span style={{ color: '#d1d5db', fontSize: 10 }}>↕</span>}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((f) => {
                const cat = CATEGORIE_COLORS[f.categorie]
                return (
                  <tr key={f.id} className={selectedIds.has(f.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="pl-4 pr-2 py-3">
                      <input type="checkbox" checked={selectedIds.has(f.id)} onChange={() => toggleSelect(f.id)} className="w-4 h-4 rounded border-gray-300" aria-label="Sélectionner" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">{f.titre}</p>
                      <p className="text-xs text-gray-400">/{f.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      {cat && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cat.bg, color: cat.text }}>{cat.label}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${f.statut === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {f.statut === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(f.updatedAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right">
                      <ActionMenu
                        actions={[
                        { label: 'Éditeur visuel', icon: '✏️', onClick: () => router.push(`/admin/fiches/${f.id}/editor`) },
                        { label: 'Modifier', icon: '📝', onClick: () => router.push(`/admin/fiches/${f.id}/modifier`) },
                        { label: f.statut === 'published' ? 'Dépublier' : 'Publier', icon: '●', onClick: () => handlePublishOne(f.id) },
                        { label: 'Supprimer', icon: '🗑', variant: 'danger', divider: true, onClick: () => handleDeleteOne(f.id) },
                      ]}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Afficher</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-sm"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>éléments par page</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Précédent
          </button>

          <span className="text-sm text-gray-500">
            Page {page} sur {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      </div>

      <BulkBar count={selectedIds.size} onDelete={handleBulkDelete} onClear={clearSelection} isProcessing={isProcessing} />
    </div>
  )
}
