'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  listStructures,
  deleteStructure,
  publishStructure,
} from '@/services/contentful-management'
import { ActionMenu } from '@/components/admin/ActionMenu'
import { BulkBar } from '@/components/admin/BulkBar'
import { useTableFilters } from '@/hooks/useTableFilters'
import { types } from '@/data/structures_types'

type Structure = Awaited<ReturnType<typeof listStructures>>[number]

// Icône de tri dans l'entête de colonne
function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <span style={{ color: '#d1d5db', fontSize: 10 }}>↕</span>
  return <span style={{ color: '#3b82f6', fontSize: 10 }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function AdminStructuresPage() {
  const router = useRouter()
  const [data, setData] = useState<Structure[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const charger = async () => {
    setLoading(true)
    try {
      const res = await listStructures()
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { charger() }, [])

  const {
    search, setSearch,
    filters, setFilter,
    sortKey, sortDir, toggleSort, setSort,
    filtered,
    paginated,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    selectedIds, toggleSelect, toggleSelectAll, clearSelection,
  } = useTableFilters<Structure>({
    data,
    searchFields: ['nom', 'adresse', 'organisation', 'type'],
    defaultSortKey: 'updatedAt',
    defaultSortDir: 'desc',
  })

  // Suppression d'une seule structure
  const handleDeleteOne = async (id: string) => {
    setIsProcessing(true)
    try {
      await deleteStructure(id)
      toast.success('Structure supprimée.')
      charger()
    } catch {
      toast.error('Erreur lors de la suppression.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Publication d'une structure
  const handlePublishOne = async (id: string) => {
    try {
      await publishStructure(id)
      toast.success('Structure publiée.')
      charger()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur de publication.')
    }
  }

  // Suppression en masse
  const handleBulkDelete = async () => {
    if (!window.confirm(`Supprimer définitivement ${selectedIds.size} structure(s) ?`)) return
    setIsProcessing(true)
    try {
      await Promise.all([...selectedIds].map(deleteStructure))
      toast.success(`${selectedIds.size} structure(s) supprimée(s).`)
      clearSelection()
      charger()
    } catch {
      toast.error('Erreur lors de la suppression en masse.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Publication en masse
  const handleBulkPublish = async () => {
    setIsProcessing(true)
    try {
      await Promise.all([...selectedIds].map(publishStructure))
      toast.success(`${selectedIds.size} structure(s) publiée(s).`)
      clearSelection()
      charger()
    } catch {
      toast.error('Erreur lors de la publication en masse.')
    } finally {
      setIsProcessing(false)
    }
  }

  const allFilteredIds = filtered.map((s) => s.id)
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id))

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>

  return (
    <div className="p-6">

      {/* ── EN-TÊTE ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Structures</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length !== data.length
              ? `${filtered.length} sur ${data.length} structures`
              : `${data.length} structure${data.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/admin/structures/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvelle structure
        </Link>
      </div>

      {/* ── FILTRES ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center">

        {/* Recherche */}
        <div className="relative flex-1 min-w-56">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, adresse, organisation..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Filtre statut */}
        <select
          value={filters.statut ?? ''}
          onChange={(e) => setFilter('statut', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
        >
          <option value="">Statut (tous)</option>
          <option value="published">Publié</option>
          <option value="draft">Brouillon</option>
        </select>

        {/* Filtre type */}
        <select
          value={filters.type ?? ''}
          onChange={(e) => setFilter('type', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
        >
          <option value="">Type (tous)</option>
          {Object.keys(types).map((k) => (
            <option key={k} value={k}>{types[k as keyof typeof types].nom}</option>
          ))}
        </select>

        <select
          value={String(sortKey) ?? 'updatedAt'}
          onChange={(e) => setSort(e.target.value as keyof Structure, sortDir)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
        >
          <option value="updatedAt">Tri: Dernière modification</option>
          <option value="nom">Tri: Nom</option>
          <option value="type">Tri: Type</option>
          <option value="adresse">Tri: Adresse</option>
          <option value="statut">Tri: Statut</option>
        </select>

        <select
          value={sortDir}
          onChange={(e) => setSort((sortKey ?? 'updatedAt') as keyof Structure, e.target.value as 'asc' | 'desc')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
        >
          <option value="desc">Ordre: décroissant</option>
          <option value="asc">Ordre: croissant</option>
        </select>

        {/* Reset */}
        {(search || Object.values(filters).some(Boolean)) && (
          <button
            type="button"
            onClick={() => { setSearch(''); setFilter('statut', ''); setFilter('type', '') }}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
          >
            ✕ Reset
          </button>
        )}
      </div>

      {/* ── TABLEAU ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {/* Case à cocher "tout sélectionner" */}
              <th className="pl-4 pr-2 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => toggleSelectAll(allFilteredIds)}
                  className="w-4 h-4 rounded border-gray-300"
                  aria-label="Sélectionner tout"
                />
              </th>

              {/* Colonnes triables */}
              {[
                { key: 'nom', label: 'Nom' },
                { key: 'type', label: 'Type' },
                { key: 'adresse', label: 'Adresse' },
                { key: 'statut', label: 'Statut' },
                { key: 'updatedAt', label: 'Modifié' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key as keyof Structure)}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon active={sortKey === key} dir={sortDir} />
                  </span>
                </th>
              ))}

              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                  Aucune structure ne correspond à vos critères.
                </td>
              </tr>
            )}

            {paginated.map((s) => (
              <tr
                key={s.id}
                className={`transition-colors ${selectedIds.has(s.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                {/* Checkbox */}
                <td className="pl-4 pr-2 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    className="w-4 h-4 rounded border-gray-300"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Sélectionner ${s.nom}`}
                  />
                </td>

                {/* Nom */}
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 text-sm">{s.nom}</p>
                  {s.organisation && <p className="text-xs text-gray-400">{s.organisation}</p>}
                </td>

                {/* Type */}
                <td className="px-4 py-3 text-sm text-gray-600 max-w-32">
                  <span className="truncate block">{s.type}</span>
                </td>

                {/* Adresse */}
                <td className="px-4 py-3 text-sm text-gray-500 max-w-48">
                  <span className="truncate block">{s.adresse}</span>
                </td>

                {/* Statut */}
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    s.statut === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                  >
                    {s.statut === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </td>

                {/* Date modif */}
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(s.updatedAt).toLocaleDateString('fr-FR')}
                </td>

                {/* Menu actions */}
                <td className="px-4 py-3 text-right">
                  <ActionMenu actions={[
                    {
                      label: 'Modifier',
                      icon: '✏️',
                      onClick: () => router.push(`/admin/structures/${s.id}/editor`),
                    },
                    {
                      label: s.statut === 'published' ? 'Dépublier' : 'Publier',
                      icon: s.statut === 'published' ? '○' : '●',
                      onClick: () => handlePublishOne(s.id),
                    },
                    {
                      label: 'Ouvrir dans Contentful',
                      icon: '↗',
                      onClick: () => window.open(s.contentfulUrl, '_blank'),
                    },
                    {
                      label: 'Supprimer',
                      icon: '🗑',
                      variant: 'danger',
                      divider: true,
                      onClick: () => {
                        // On utilise DeleteConfirmModal via un état local
                        // Pour simplifier on utilise confirm() ici
                        if (window.confirm(`Supprimer "${s.nom}" définitivement ?`)) {
                          handleDeleteOne(s.id)
                        }
                      },
                    },
                  ]}
                  />
                </td>
              </tr>
            ))}
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

      {/* Barre d'actions en masse */}
      <BulkBar
        count={selectedIds.size}
        onDelete={handleBulkDelete}
        onPublish={handleBulkPublish}
        onClear={clearSelection}
        isProcessing={isProcessing}
      />
    </div>
  )
}
