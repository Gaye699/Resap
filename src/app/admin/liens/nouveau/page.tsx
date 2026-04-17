'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormField, FormInput } from '@/components/Forms'
import { PrimaryButton } from '@/components/Buttons'
import { createLienInContentful } from '@/services/contentful-management'

type LienFields = {
  titre: string
  url: string
}

export default function NouveauLienPage() {
  const router = useRouter()
  // typeLien contrôle quel champ s'affiche : URL ou Fichier
  // useState = variable React qui déclenche un re-render quand elle change
  const [typeLien, setTypeLien] = useState<'url' | 'fichier'>('url')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LienFields>()

  const onSubmit = async (data: LienFields) => {
    if (typeLien === 'url' && !data.url) {
      toast.error('Veuillez renseigner une URL.')
      return
    }

    try {
      await createLienInContentful({
        titre: data.titre,
        url: typeLien === 'url' ? data.url : undefined,
      })
      toast.success('Lien créé en brouillon.')
      router.push('/admin/liens')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création.')
    }
  }

  return (
    <div className="p-8 max-w-xl">
      <Link href="/admin/liens" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Retour aux liens
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nouveau lien</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <FormField
            name="titre"
            required
            label="Titre du lien"
            error={errors.titre && 'Le titre est requis.'}
          >
            <FormInput
              type="text"
              id="titre"
              placeholder="Ex : Guide AME 2024"
              error={!!errors.titre}
              {...register('titre', { required: true })}
            />
          </FormField>

          {/* Choix exclusif URL ou Fichier */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Type de contenu <span className="text-red-500">*</span>
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-amber-700">
              ⚠️ Si vous renseignez les deux (URL et fichier), <strong>le fichier sera prioritaire</strong> sur l&apos;URL.
              Préférez ne remplir qu&apos;un seul des deux champs.
            </div>
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="url"
                  checked={typeLien === 'url'}
                  onChange={() => setTypeLien('url')}
                />
                <span className="text-sm text-gray-700">🔗 Lien URL externe</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="fichier"
                  checked={typeLien === 'fichier'}
                  onChange={() => setTypeLien('fichier')}
                />
                <span className="text-sm text-gray-700">📎 Fichier (PDF, doc...)</span>
              </label>
            </div>
          </div>

          {/* Champ URL — affiché seulement si typeLien === 'url' */}
          {typeLien === 'url' && (
            <FormField name="url" required label="URL">
              <FormInput
                type="url"
                id="url"
                placeholder="https://exemple.fr"
                {...register('url')}
              />
            </FormField>
          )}

          {/* Champ Fichier — affiché seulement si typeLien === 'fichier' */}
          {typeLien === 'fichier' && (
            <div>
              <label htmlFor="fichier" className="block text-sm font-medium text-gray-700 mb-1">
                Fichier <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                id="fichier"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400 mt-1">
                L&apos;upload de fichier vers Contentful Assets sera connecté
                une fois les tokens disponibles.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer en brouillon'}
            </PrimaryButton>
            <Link
              href="/admin/liens"
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              Annuler
            </Link>
          </div>

        </form>
      </div>
    </div>
  )
}
