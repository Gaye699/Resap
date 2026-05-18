'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFicheVide, updateFicheInContentful } from '@/services/contentful-management'

export default function NouvelleFichePage() {
  const router = useRouter()
  const [titre, setTitre] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const slugify = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const handleCreate = async () => {
    if (!titre.trim()) return
    setIsCreating(true)
    setError(null)
    try {
      const { id } = await createFicheVide(titre.trim())
      router.replace(`/admin/fiches/${id}/editor`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    router.replace('/admin/fiches')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Créer une fiche</h1>
        <p className="text-sm text-gray-500 mb-4">
          Entrez le nom de la fiche puis validez.
        </p>

        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Nom de la fiche"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!titre.trim() || isCreating}
            className="flex-1 rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {isCreating ? 'Création...' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
