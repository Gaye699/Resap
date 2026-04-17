'use client'

import { SearchIcon } from '@/components/Icons/AdminIcons'

type FilterOption = { value: string; label: string }

type Props = {
  searchValue: string
  onSearchChange: (v: string) => void
  placeholder?: string
  filters?: {
    label: string
    value: string
    onChange: (v: string) => void
    options: FilterOption[]
  }[]
  totalCount: number
  filteredCount: number
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  placeholder = 'Rechercher...',
  filters = [],
  totalCount,
  filteredCount,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <div className="flex flex-wrap gap-3 items-center">

        {/* Champ de recherche texte */}
        <div className="flex-1 min-w-48 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Filtres select */}
        {filters.map((filter) => (
          <div key={filter.label}>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            >
              <option value="">{filter.label} (tous)</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Compteur de résultats */}
        <span className="text-sm text-gray-400 ml-auto">
          {filteredCount !== totalCount ? (
            <>
              {filteredCount} <span className="text-gray-300">/ {totalCount}</span>
            </>
          ) : (
            <>
              {totalCount} résultat{totalCount > 1 ? 's' : ''}
            </>
          )}
        </span>
      </div>
    </div>
  )
}
