'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  listLiens,
  deleteLien,
  publishLien,
} from '@/services/contentful-management'
import { ActionMenu } from '@/components/admin/ActionMenu'
import { BulkBar } from '@/components/admin/BulkBar'
import { useTableFilters } from '@/hooks/useTableFilters'

type Lien = Awaited<ReturnType<typeof listLiens>>[number]

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <span style={{ color: '#d1d5db', fontSize: 10 }}>↕</span>
  return <span style={{ color: '#3b82f6', fontSize: 10 }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function AdminLiensPage() {
  const router = useRouter()
  const [data, setData] = useState<Lien[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const charger = async () => {
    setLoading(true)
    try {
      setData(await listLiens())
    } finally { setLoading(false) }
  }

  useEffect(() => { charger() }, [])

  const {
    search, setSearch,
    filters, setFilter,
    sortKey, sortDir, toggleSort,
    filtered,
    paginated,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    selectedIds, toggleSelect, toggleSelectAll, clearSelection,
  } = useTableFilters<Lien>({
    data,
    searchFields: ['titre', 'url'],
    defaultSortKey: 'updatedAt',
    defaultSortDir: 'desc',
  })

  const handleDeleteOne = async (id: string) => {
    if (!window.confirm('Supprimer ce lien définitivement ?')) return
    try {
      await deleteLien(id)
      toast.success('Lien supprimé.')
      charger()
    } catch { toast.error('Erreur.') }
  }

  const handlePublishOne = async (id: string) => {
    try {
      await publishLien(id)
      toast.success('Lien publié.')
      charger()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Impossible de publier un lien vide.')
    }
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Supprimer ${selectedIds.size} lien(s) ?`)) return
    setIsProcessing(true)
    try {
      await Promise.all([...selectedIds].map(deleteLien))
      toast.success(`${selectedIds.size} lien(s) supprimé(s).`)
      clearSelection(); charger()
    } catch {
      toast.error('Erreur.')
    } finally { setIsProcessing(false) }
  }

  const liensVides = data.filter((l) => l.estVide)
  const allFilteredIds = filtered.map((l) => l.id)

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>

  return (
    <div className="p-6">

      {/* Alerte liens vides */}
      {liensVides.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="font-medium text-red-700 text-sm">
              {liensVides.length} lien(s) sans contenu
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Ces liens sont en brouillon sans URL ni fichier et ne peuvent pas être publiés.
            </p>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liens</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length !== data.length
              ? `${filtered.length} sur ${data.length} liens`
              : `${data.length} lien${data.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/admin/liens/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + Nouveau lien
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-56">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, URL..."
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

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.estVide}
            onChange={(e) => setFilter('estVide', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded"
          />
          Afficher seulement les vides
        </label>

        {(search || Object.values(filters).some(Boolean)) && (
          <button type="button" onClick={() => { setSearch(''); setFilter('statut', ''); setFilter('estVide', '') }} className="text-xs text-gray-400 hover:text-gray-600">✕ Reset</button>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="pl-4 pr-2 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id))}
                  onChange={() => toggleSelectAll(allFilteredIds)}
                  className="w-4 h-4 rounded border-gray-300"
                  aria-label="Sélectionner tout"
                />
              </th>
              {[
                { key: 'titre', label: 'Titre' },
                { key: 'url', label: 'Contenu' },
                { key: 'statut', label: 'Statut' },
                { key: 'updatedAt', label: 'Modifié' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key as keyof Lien)}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon active={sortKey === key} dir={sortDir} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">

            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                  Aucun lien trouvé.
                </td>
              </tr>
            )}
            {paginated.map((l) => {
            let rowClassName = 'hover:bg-gray-50'

            if (l.estVide) {
              rowClassName = 'bg-red-50'
            } else if (selectedIds.has(l.id)) {
              rowClassName = 'bg-blue-50'
            }

            return (
              <tr
                key={l.id}
                className={`transition-colors ${rowClassName}`}
              >
                <td className="pl-4 pr-2 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(l.id)}
                    onChange={() => toggleSelect(l.id)}
                    className="w-4 h-4 rounded border-gray-300"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Sélectionner le lien"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {l.estVide && <span title="Lien vide" className="text-red-400">⚠️</span>}
                    <p className="font-medium text-gray-900 text-sm">{l.titre}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                  {l.url && (
                    <span className="flex items-center gap-1 truncate">
                      🔗 <span className="truncate">{l.url}</span>
                    </span>
                  )}
                  {l.hasFichier && <span>📎 Fichier attaché</span>}
                  {l.estVide && <span className="text-red-400 italic text-xs">Aucun contenu</span>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      l.statut === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {l.statut === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(l.updatedAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <ActionMenu
                    actions={[
                      {
                        label: 'Modifier',
                        icon: '📝',
                        onClick: () => router.push(`/admin/liens/${l.id}/modifier`),
                      },
                      {
                        label: l.statut === 'published' ? 'Dépublier' : 'Publier',
                        icon: l.statut === 'published' ? '○' : '●',
                        onClick: () => handlePublishOne(l.id),
                        disabled: l.estVide && l.statut !== 'published',
                      },
                      {
                        label: 'Supprimer',
                        icon: '🗑',
                        variant: 'danger',
                        divider: true,
                        onClick: () => handleDeleteOne(l.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            )
          })}

          </tbody>
        </table>
      </div>
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
      <BulkBar
        count={selectedIds.size}
        onDelete={handleBulkDelete}
        onClear={clearSelection}
        isProcessing={isProcessing}
      />
    </div>
  )
}
