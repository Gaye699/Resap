'use client'

import Link from 'next/link'
import { AdminStructureForm, AdminStructureFields } from '@/components/admin/AdminStructureForm'
import { createStructureInContentful } from '@/services/contentful-management'

export default function NouvelleStructurePage() {
  const handleSave = async (data: AdminStructureFields) => {
    // createStructureInContentful existe déjà dans le projet !
    // On l'appelle directement — pas besoin de route API intermédiaire
    // car 'use server' dans contentful-management.ts autorise l'appel direct.
    await createStructureInContentful({
      nom: data.nom,
      organisation: data.organisation,
      type: data.type,
      adresse: data.adresse,
      siteWeb: data.siteWeb,
      email: data.email,
      tel: data.tel,
      description: data.description,
    })
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/admin/structures"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1"
      >
        ← Retour aux structures
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle structure</h1>
        <p className="text-gray-500 mt-1">
          La structure sera créée en brouillon dans l&apos;environnement{' '}
          <strong>{process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'dev'}</strong>.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <AdminStructureForm
          onSave={handleSave}
          backHref="/admin/structures"
        />
      </div>
    </div>
  )
}
