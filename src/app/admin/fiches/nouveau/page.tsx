'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFicheVide } from '@/services/contentful-management'

export default function NouvelleFichePage() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setCreating(true)
    try {
      const { id } = await createFicheVide()
      router.push(`/admin/fiches/${id}/editor`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création.')
      setCreating(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/fiches')
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full
        text-center shadow-sm"
      >

        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Nouvelle fiche pratique</h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Une fiche brouillon sera créée dans Contentful (environnement{' '}
          <strong className="text-blue-600">
            {process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'dev'}
          </strong>
          ), puis vous pourrez la compléter dans l&apos;éditeur visuel.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200
            rounded-lg p-3"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-3 bg-blue-600 text-white text-sm font-semibold
              rounded-xl hover:bg-blue-700 disabled:opacity-50
              disabled:cursor-not-allowed transition-colors flex items-center
              justify-center gap-2"
          >
            {creating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent
                  rounded-full animate-spin"
                />
                Création en cours...
              </>
            ) : (
              '+ Créer la fiche et ouvrir l\'éditeur'
            )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={creating}
            className="w-full py-3 border border-gray-200 text-gray-600 text-sm
              font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50
              transition-colors"
          >
            Annuler — retour aux fiches
          </button>
        </div>
      </div>
    </div>
  )
}
