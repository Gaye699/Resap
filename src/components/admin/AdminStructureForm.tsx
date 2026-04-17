'use client'

import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormField, FormInput, FormSelect } from '@/components/Forms'
import { PrimaryButton } from '@/components/Buttons'
import { types } from '@/data/structures_types'
import { RichTextEditor } from '@/components/admin/editor/RichTextEditor'

export type AdminStructureFields = {
  nom: string
  organisation: string
  type: string
  description: string
  specialites: string
  adresse: string
  siteWeb: string
  email: string
  tel: string
}

// eslint-disable-next-line no-control-regex
const emailRegexp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

type Props = {
  defaultValues?: Partial<AdminStructureFields>
  onSave: (data: AdminStructureFields) => Promise<void>
  onPublish?: () => Promise<void>
  publishLabel?: string
  backHref?: string
}

export const AdminStructureForm = ({
  defaultValues,
  onSave,
  onPublish,
  backHref = '/admin/structures',
}: Props) => {
  const router = useRouter()
  const structureTypes = Object.keys(types)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AdminStructureFields>({ defaultValues })

  const onSubmit = async (data: AdminStructureFields) => {
    try {
      await onSave(data)
      toast.success('Sauvegardé en brouillon.')
      router.push(backHref)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde.')
    }
  }

  const handlePublishClick = async () => {
    if (!onPublish) return
    try {
      await onPublish()
      toast.success('Publié sur le site !')
      router.push(backHref)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la publication.')
    }
  }

  const publishLabel = defaultValues?.nom && (defaultValues as any).statut === 'published'
    ? 'Dépublier'
    : 'Publier sur le site'

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ── Section : Identification ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">

        {/* Nom */}
        <FormField
          className="sm:col-span-4"
          name="nom"
          required
          label="Nom de la structure"
          error={errors.nom && 'Le nom est requis.'}
        >
          <FormInput
            type="text"
            id="nom"
            error={!!errors.nom}
            {...register('nom', { required: true })}
          />
        </FormField>

        {/* Type dispositif */}
        <FormField
          className="sm:col-span-2"
          name="type"
          required
          label="Type de dispositif"
          error={errors.type && 'Le type est requis.'}
        >
          <FormSelect id="type" error={!!errors.type} {...register('type', { required: true })}>
            <option value="">Sélectionnez</option>
            {structureTypes.map((t) => (
              <option key={t} value={t}>{types[t as keyof typeof types].nom}</option>
            ))}
          </FormSelect>
        </FormField>

        {/* Organisation */}
        <FormField className="sm:col-span-3" name="organisation" label="Nom de l'organisation / réseau">
          <FormInput type="text" id="organisation" {...register('organisation')} />
        </FormField>

        {/* Spécialités/tags */}
        <FormField
          className="sm:col-span-3"
          name="specialites"
          label="Spécialités (tags)"
        >
          <FormInput
            type="text"
            id="specialites"
            placeholder="Ex : migrants, SDF, addiction"
            {...register('specialites')}
          />
          <p className="text-xs text-gray-400 mt-1">Séparés par des virgules.</p>
        </FormField>
      </div>

      {/* ── Section : Description (rich text) ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Description de la structure..."
              minHeight={150}
            />
          )}
        />
      </div>

      {/* ── Section : Localisation ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">Localisation</h3>
        <p className="text-xs text-blue-600 mb-4">
          Entrez l&apos;adresse complète une seule fois. Les coordonnées GPS seront calculées automatiquement
          pour placer le point sur la carte, et l&apos;adresse s&apos;affichera dans l&apos;annuaire.
        </p>
        <FormField
          name="adresse"
          required
          label="Adresse complète"
          error={errors.adresse && "L'adresse est requise."}
        >
          <FormInput
            type="text"
            id="adresse"
            error={!!errors.adresse}
            placeholder="Ex : 5 Rue Smith, 69002 Lyon, France"
            {...register('adresse', { required: true })}
          />
        </FormField>
      </div>

      {/* ── Section : Contact ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
        <FormField
          className="sm:col-span-4"
          name="email"
          label="Email"
          error={errors.email && 'Format d\'email invalide.'}
        >
          <FormInput
            type="email"
            id="email"
            error={!!errors.email}
            {...register('email', {
              pattern: { value: emailRegexp, message: 'Email invalide' },
            })}
          />
        </FormField>

        <FormField className="sm:col-span-2" name="tel" label="Téléphone">
          <FormInput type="tel" id="tel" {...register('tel')} />
        </FormField>

        <FormField className="sm:col-span-full" name="siteWeb" label="Site web">
          <FormInput type="url" id="siteWeb" placeholder="https://..." {...register('siteWeb')} />
        </FormField>
      </div>

      {/* ── Boutons ── */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
        <PrimaryButton
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-6 py-2.5"
        >
          {isSubmitting && (
            <span className="-ml-1 mr-2 w-4 h-4 border-2 border-transparent border-l-white rounded-full animate-spin" />
          )}
          {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder en brouillon'}
        </PrimaryButton>

        {onPublish && (
          <button
            type="button"
            onClick={handlePublishClick}
            className={`px-5 py-2.5 text-white text-sm font-medium rounded-md transition-colors ${
              publishLabel === 'Dépublier'
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-green-600 hover:bg-green-700'
              }`}
          >
            {publishLabel ?? 'Publier sur le site'}
          </button>
        )}

        <Link href={backHref} className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
          Annuler
        </Link>
      </div>

    </form>
  )
}
