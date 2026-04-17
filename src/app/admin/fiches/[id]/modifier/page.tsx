'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AdminFicheForm, AdminFicheFields } from '@/components/admin/AdminFicheForm'
import {
  getFicheById,
  updateFicheInContentful,
  publishFiche,
} from '@/services/contentful-management'

export default function ModifierFichePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [defaultValues, setDefaultValues] = useState<Partial<AdminFicheFields>>()
  const [illustrationUrl, setIllustrationUrl] = useState<string>()
  const [isPublished, setIsPublished] = useState(false)
  const [nomFiche, setNomFiche] = useState('')

  useEffect(() => {
    getFicheById(id).then((fiche) => {
      setDefaultValues({
        titre: fiche.titre,
        slug: fiche.slug,
        categorie: fiche.categorie,
        description: fiche.description,
        tags: fiche.tags.join(', '),
        resume: fiche.resume,
        contenu: fiche.contenu,
        typeDispositif: fiche.typeDispositif,
        // Liens associés
        outilsIds: fiche.outilsIds ?? [],
        patientsIds: fiche.patientsIds ?? [],
        pourEnSavoirPlusIds: fiche.pourEnSavoirPlusIds ?? [],
      })
      setIllustrationUrl(fiche.illustrationUrl)
      setIsPublished(fiche.statut === 'published')
      setNomFiche(fiche.titre)
      setLoading(false)
    }).catch(() => {
      toast.error('Impossible de charger la fiche.')
      router.push('/admin/fiches')
    })
  }, [id, router])

  const handleSave = async (data: AdminFicheFields) => {
    // Sauvegarde champs texte
    await updateFicheInContentful(id, {
      titre: data.titre,
      categorie: data.categorie,
      description: data.description,
      tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
      resume: data.resume,
      contenu: data.contenu,
      typeDispositif: data.typeDispositif ?? [],
    })

    // Sauvegarde les liens associés
    await updateFicheLiens(id, {
      outils: data.outilsIds ?? [],
      patients: data.patientsIds ?? [],
      pourEnSavoirPlus: data.pourEnSavoirPlusIds ?? [],
    })

    toast.success('Fiche sauvegardée en brouillon.')
  }

  const handlePublish = async () => {
    await publishFiche(id)
    toast.success('Fiche publiée !')
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-gray-400">
        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        Chargement de la fiche...
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/admin/fiches"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1"
      >
        ← Retour aux fiches
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier la fiche</h1>
          <p className="text-gray-500 mt-1 text-sm">{nomFiche}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}
          >
            {isPublished ? '● Publié' : '○ Brouillon'}
          </span>
          {/* Lien vers l'éditeur visuel */}
          <Link
            href={`/admin/fiches/${id}/editor`}
            className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
          >
            ✏️ Éditeur visuel
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <AdminFicheForm
          ficheId={id}
          illustrationUrl={illustrationUrl}
          defaultValues={defaultValues}
          onSave={handleSave}
          onPublish={!isPublished ? handlePublish : undefined}
          backHref="/admin/fiches"
        />
      </div>
    </div>
  )
}
