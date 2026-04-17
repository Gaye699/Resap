'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AdminStructureForm, AdminStructureFields } from '@/components/admin/AdminStructureForm'
import {
  getStructureById,
  updateStructureInContentful,
  publishStructure,
  unpublishStructure,
} from '@/services/contentful-management'

export default function ModifierStructurePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [defaultValues, setDefaultValues] = useState<Partial<AdminStructureFields>>()
  const [isPublished, setIsPublished] = useState(false)
  const [nomStructure, setNomStructure] = useState('')

  useEffect(() => {
    getStructureById(id).then((s) => {
      // Remplit TOUS les champs — identique à la création
      setDefaultValues({
        nom: s.nom,
        organisation: s.organisation,
        type: s.type,
        adresse: s.adresse,
        email: s.email,
        tel: s.tel,
        siteWeb: s.siteWeb,
        description: s.description,
        // specialites est un tableau dans Contentful, on joint en string pour le formulaire
        specialites: Array.isArray(s.specialites) ? s.specialites.join(', ') : (s.specialites ?? ''),
      })
      setIsPublished(s.statut === 'published')
      setNomStructure(s.nom)
      setLoading(false)
    }).catch(() => {
      toast.error('Impossible de charger la structure.')
      router.push('/admin/structures')
    })
  }, [id, router])

  const handleSave = async (data: AdminStructureFields) => {
    await updateStructureInContentful(id, {
      nom: data.nom,
      organisation: data.organisation,
      type: data.type,
      adresse: data.adresse,
      email: data.email,
      tel: data.tel,
      siteWeb: data.siteWeb,
      description: data.description,
      specialites: data.specialites
        ? data.specialites.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    })
    toast.success('Structure sauvegardée en brouillon.')
  }

  const handlePublish = async () => {
    if (isPublished) {
      await unpublishStructure(id)
      toast.success('Structure dépubliée.')
      setIsPublished(false)
    } else {
      await publishStructure(id)
      toast.success('Structure publiée !')
      setIsPublished(true)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-gray-400">
        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        Chargement...
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/admin/structures"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1"
      >
        ← Retour aux structures
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier la structure</h1>
          <p className="text-gray-500 mt-1 text-sm">{nomStructure}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}
          >
            {isPublished ? '● Publié' : '○ Brouillon'}
          </span>
          <Link
            href={`/admin/structures/${id}/editor`}
            className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            ✏️ Éditeur visuel
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <AdminStructureForm
          defaultValues={defaultValues}
          onSave={handleSave}
          // onPublish gère les deux cas (publier ET dépublier)
          onPublish={handlePublish}
          publishLabel={isPublished ? 'Dépublier' : 'Publier sur le site'}
          backHref="/admin/structures"
        />
      </div>
    </div>
  )
}
