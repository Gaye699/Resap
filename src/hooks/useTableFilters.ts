import { useEffect, useMemo, useState } from 'react'

type SortDirection = 'asc' | 'desc'

type UseTableFiltersOptions<T> = {
  data: T[]
  // Champs à inclure dans la recherche texte
  searchFields: (keyof T)[]
  // Valeur initiale du tri
  defaultSortKey?: keyof T
  defaultSortDir?: SortDirection
  defaultPageSize?: number
}

export function useTableFilters<T extends Record<string, any>>({
  data,
  searchFields,
  defaultSortKey,
  defaultSortDir = 'desc',
  defaultPageSize = 50,
}: UseTableFiltersOptions<T>) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultSortKey)
  const [sortDir, setSortDir] = useState<SortDirection>(defaultSortDir)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  // Met à jour un filtre par clé
  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Bascule le tri sur une colonne
  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const setSort = (key: keyof T, dir: SortDirection = 'asc') => {
    setSortKey(key)
    setSortDir(dir)
  }

  // Toggle sélection d'un élément
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Sélectionner / désélectionner tout (sur les éléments filtrés)
  const toggleSelectAll = (ids: string[]) => {
    if (ids.every((id) => selectedIds.has(id))) {
      // Tout est sélectionné → tout désélectionner
      setSelectedIds(new Set())
    } else {
      // Pas tout sélectionné → sélectionner tout
      setSelectedIds(new Set(ids))
    }
  }

const clearSelection = () => setSelectedIds(new Set())

useEffect(() => {
  setPage(1)
}, [search, filters, sortKey, sortDir, pageSize])

// Données filtrées et triées
const filtered = useMemo(() => {
  let result = [...data]

  // Recherche texte
  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter((item) => searchFields.some((field) => {
      const val = item[field]
      return typeof val === 'string' && val.toLowerCase().includes(q)
    }))
  }

  // Filtres
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      result = result.filter((item) => item[key] === value)
    }
  })

  // Tri
  if (sortKey) {
    result.sort((a, b) => {
      const va = a[sortKey] ?? ''
      const vb = b[sortKey] ?? ''
      const cmp = String(va).localeCompare(String(vb), 'fr', { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  return result
}, [data, search, filters, sortKey, sortDir, searchFields])

const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

const paginated = useMemo(() => {
  const start = (page - 1) * pageSize
  return filtered.slice(start, start + pageSize)
}, [filtered, page, pageSize])

useEffect(() => {
  if (page > totalPages) {
    setPage(totalPages)
  }
}, [page, totalPages])

  return {
    search,
    setSearch,
    filters,
    setFilter,
    sortKey,
    sortDir,
    toggleSort,
    setSort,
    filtered,
    paginated,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  }
}
