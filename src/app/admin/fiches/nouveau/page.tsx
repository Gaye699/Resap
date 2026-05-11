'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFicheVide } from '@/services/contentful-management'

export default function NouvelleFichePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        const { id } = await createFicheVide()
        if (!mounted) return
        router.replace(`/admin/fiches/${id}/editor`)
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'Erreur lors de la creation.')
      }
    }

    run()
    return () => { mounted = false }
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
        {!error && (
          <>
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Creation de la fiche...</h1>
            <p className="text-sm text-gray-500">Redirection vers l editeur en cours.</p>
          </>
        )}

        {error && (
          <>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Creation impossible</h1>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => router.push('/admin/fiches')}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Retour aux fiches
            </button>
          </>
        )}
      </div>
    </div>
  )
}
