'use client'

import Link from 'next/link'
import { AdminFicheForm, AdminFicheFields } from '@/components/admin/AdminFicheForm'
import { createFicheInContentful } from '@/services/contentful-management'

export default function NouvelleFichePage() {
  const handleSave = async (data: AdminFicheFields) => {
    await createFicheInContentful({
      titre: data.titre,
      slug: data.slug,
      categorie: data.categorie,
      description: data.description,
      tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
      resume: data.resume,
      contenu: data.contenu,
      typeDispositif: data.typeDispositif ?? [],
    })
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/admin/fiches" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Retour aux fiches
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle fiche pratique</h1>
        <p className="text-gray-500 mt-1">
          La fiche sera créée en brouillon dans l&apos;environnement{' '}
          <strong className="text-blue-600">{process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'dev'}</strong>.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <AdminFicheForm
          onSave={handleSave}
          backHref="/admin/fiches"
          isCreation
        />
      </div>
    </div>
  )
}
