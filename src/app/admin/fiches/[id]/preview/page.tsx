'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { getStructureById, updateStructureInContentful, publishStructure } from '@/services/contentful-management'
import { AdminStructureFields } from '@/components/admin/AdminStructureForm'
import { types } from '@/data/structures_types'
import { PrimaryButton } from '@/components/Buttons'

export default function StructurePreviewPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isPublished, setIsPublished] = useState(false)

  const { register, watch, reset, handleSubmit, formState: { isSubmitting } } = useForm<AdminStructureFields>()

  // watch() observe TOUS les champs en temps réel → alimente la preview
  const formValues = watch()

  useEffect(() => {
    getStructureById(id).then((s) => {
      reset({ nom: s.nom,
        organisation: s.organisation,
        type: s.type,
        adresse: s.adresse,
        email: s.email,
        tel: s.tel,
        siteWeb: s.siteWeb,
        description: s.description })
      setIsPublished(s.statut === 'published')
      setLoading(false)
    })
  }, [id, reset])

  const onSubmit = async (data: AdminStructureFields) => {
    try {
      await updateStructureInContentful(id, {
        ...data,
        specialites: data.specialites
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      })
      toast.success('Sauvegardé en brouillon.')
      router.refresh()
    } catch (_e) {
      toast.error('Erreur lors de la sauvegarde.')
    }
  }

  const handlePublish = async () => {
    try {
      await publishStructure(id)
      toast.success('Structure publiée !')
      setIsPublished(true)
    } catch (_e) {
      toast.error('Erreur de publication.')
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>

  const structureTypes = Object.keys(types)

  return (
    // Layout split : 2 colonnes égales
    <div className="flex h-screen overflow-hidden">

      {/* ── COLONNE GAUCHE : formulaire ── */}
      <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white">

        {/* Barre d'actions */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <Link href="/admin/structures" className="text-sm text-gray-500 hover:text-gray-700">
            ← Retour
          </Link>
          <div className="flex gap-2">
            <PrimaryButton
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="text-xs px-4 py-1.5"
            >
              Sauvegarder
            </PrimaryButton>
            {!isPublished && (
              <button
                type="button"
                onClick={handlePublish}
                className="text-xs px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Publier
              </button>
            )}
          </div>
        </div>

        {/* Champs */}
        <form className="p-6 space-y-4">
          {[
            { name: 'nom', label: 'Nom', type: 'text' },
            { name: 'organisation', label: 'Organisation', type: 'text' },
            { name: 'adresse', label: 'Adresse', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'tel', label: 'Téléphone', type: 'tel' },
            { name: 'siteWeb', label: 'Site web', type: 'url' },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
              <input
                type={type}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                {...register(name as keyof AdminStructureFields)}
              />
            </div>
          ))}

          <div>
            <label htmlFor="type" className="block text-xs font-medium text-gray-500 mb-1">Type</label>
            <select
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              {...register('type')}
            >
              {structureTypes.map((t) => (
                <option key={t} value={t}>{types[t as keyof typeof types].nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea
              rows={4}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              {...register('description')}
            />
          </div>
        </form>
      </div>

      {/* ── COLONNE DROITE : preview en temps réel ── */}
      <div className="w-1/2 overflow-y-auto bg-gray-50">

        {/* En-tête de la preview */}
        <div className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-medium">Preview temps réel</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isPublished ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {isPublished ? 'Publié' : 'Brouillon'}
          </span>
        </div>

        {/* Rendu de la structure comme sur le site public */}
        <div className="p-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

            {/* Header de la fiche structure */}
            <div className="bg-blue-50 px-6 py-5 border-b border-blue-100">
              <h1 className="text-2xl font-bold text-blue-900">
                {formValues.nom || <span className="text-gray-300 italic">Nom de la structure</span>}
              </h1>
              {formValues.organisation && (
                <p className="text-blue-700 mt-1">{formValues.organisation}</p>
              )}
              {formValues.type && (
                <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                  {formValues.type}
                </span>
              )}
            </div>

            {/* Corps */}
            <div className="px-6 py-5 space-y-4">
              {formValues.description && (
                <p className="text-gray-600 text-sm leading-relaxed">{formValues.description}</p>
              )}

              <div className="space-y-2">
                {formValues.adresse && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-gray-400 mt-0.5">📍</span>
                    <span>{formValues.adresse}</span>
                  </div>
                )}
                {formValues.tel && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-400">📞</span>
                    <span>{formValues.tel}</span>
                  </div>
                )}
                {formValues.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-400">✉️</span>
                    <span>{formValues.email}</span>
                  </div>
                )}
                {formValues.siteWeb && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">🌐</span>
                    <a href={formValues.siteWeb} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {formValues.siteWeb}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-gray-400 mt-4">
            La preview se met à jour en temps réel pendant que vous modifiez les champs.
          </p>
        </div>
      </div>
    </div>
  )
}
