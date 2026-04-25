'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFicheVide } from '@/services/contentful-management'

export default function NouvelleFichePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Création immédiate d'une fiche brouillon vide
    createFicheVide()
      .then(({ id }) => {
        // Redirige vers l'éditeur visuel avec la nouvelle fiche
        router.replace(`/admin/fiches/${id}/editor`)
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Erreur lors de la création.')
      })
  }, [router])

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <a href="/admin/fiches" className="text-blue-600 hover:underline text-sm">
          ← Retour aux fiches
        </a>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent
          rounded-full animate-spin mx-auto mb-4"
        />
        <p className="text-gray-600 text-sm">Création de la nouvelle fiche...</p>
      </div>
    </div>
  )
}
