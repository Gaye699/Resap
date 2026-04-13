'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FormField, FormInput } from '@/components/Forms'
import { PrimaryButton } from '@/components/Buttons'
import { getLienById, updateLienInContentful, publishLien } from '@/services/contentful-management'

type LienFields = { titre: string; url: string }

export default function ModifierLienPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [isPublished, setIsPublished] = useState(false)
  const [estVide, setEstVide] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LienFields>()

  // Charger les données du lien au montage du composant
  useEffect(() => {
    getLienById(id).then((lien) => {
      // reset() pré-remplit le formulaire avec les données existantes
      reset({ titre: lien.titre, url: lien.url ?? '' })
      setIsPublished(lien.statut === 'published')
      setEstVide(lien.estVide)
      setLoading(false)
    }).catch(() => {
      toast.error('Impossible de charger le lien.')
      router.push('/admin/liens')
    })
  }, [id, reset, router])

  const onSubmit = async (data: LienFields) => {
    try {
      await updateLienInContentful(id, { titre: data.titre, url: data.url })
      toast.success('Lien mis à jour en brouillon.')
      router.push('/admin/liens')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur.')
    }
  }

  const handlePublish = async () => {
    try {
      await publishLien(id)
      toast.success('Lien publié !')
      router.push('/admin/liens')
      router.refresh()
    } catch (error) {
      // publishLien() lance une erreur si le lien est vide
      toast.error(error instanceof Error ? error.message : 'Erreur de publication.')
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Chargement...</div>
  }

  return (
    <div className="p-8 max-w-xl">
      <Link href="/admin/liens" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Retour aux liens
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Modifier le lien</h1>

      {estVide && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          ⚠️ Ce lien n&apo;a pas d&apo;URL ni de fichier. Ajoutez-en un avant de publier.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <FormField name="titre" required label="Titre" error={errors.titre && 'Requis.'}>
            <FormInput type="text" id="titre" error={!!errors.titre} {...register('titre', { required: true })} />
          </FormField>

          <FormField name="url" label="URL">
            <FormInput type="url" id="url" placeholder="https://..." {...register('url')} />
          </FormField>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder en brouillon'}
            </PrimaryButton>

            {!isPublished && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={estVide}
                className={`px-5 py-2.5 text-sm font-medium rounded-md transition-colors
                  ${estVide
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'}`}
                title={estVide ? 'Ajoutez une URL avant de publier' : ''}
              >
                Publier
              </button>
            )}

            <Link href="/admin/liens" className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
