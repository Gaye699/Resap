'use client'

import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormField, FormInput, FormTextarea, FormSelect } from '@/components/Forms'
import { PrimaryButton } from '@/components/Buttons'
import { types } from '@/data/structures_types'

// Les champs du formulaire — exactement les champs métier de la structure
export type AdminStructureFields = {
  nom: string
  organisation: string
  type: string
  description: string
  adresse: string
  siteWeb: string
  email: string
  tel: string
}

type Props = {
  // defaultValues = undefined en création, objet rempli en édition
  defaultValues?: Partial<AdminStructureFields>
  // onSave = appelé quand on clique "Sauvegarder en brouillon"
  onSave: (data: AdminStructureFields) => Promise<void>
  // onPublish = appelé quand on clique "Publier". Absent en mode création.
  onPublish?: () => Promise<void>
  // Lien du bouton Annuler
  backHref?: string
}

// Même regex email que le formulaire public du projet
// eslint-disable-next-line no-control-regex
const emailRegexp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

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
    formState: { errors, isSubmitting },
  } = useForm<AdminStructureFields>({
    defaultValues,
    // defaultValues pré-remplit tous les champs en mode édition.
    // En mode création, tous les champs sont vides.
  })

  const onSubmit = async (data: AdminStructureFields) => {
    try {
      await onSave(data)
      toast.success('Sauvegardé en brouillon avec succès.')
      router.push(backHref)
      // refresh() force Next.js à recharger les données de la page liste
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Une erreur est survenue.',
      )
    }
  }

  const handlePublishClick = async () => {
    if (!onPublish) return
    try {
      await onPublish()
      toast.success('Publié sur le site avec succès !')
      router.push(backHref)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la publication.',
      )
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-8"
    >
      {/* Nom */}
      <FormField
        className="sm:col-span-full"
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

      {/* Type + Organisation sur la même ligne */}
      <FormField
        className="sm:col-span-3"
        name="type"
        required
        label="Type de dispositif"
        error={errors.type && 'Le type est requis.'}
      >
        <FormSelect
          id="type"
          error={!!errors.type}
          {...register('type', { required: true })}
        >
          <option value="">Sélectionnez un type</option>
          {structureTypes.map((type) => (
            <option key={type} value={type}>
              {types[type as keyof typeof types].nom}
            </option>
          ))}
        </FormSelect>
      </FormField>

      <FormField
        className="sm:col-span-3"
        name="organisation"
        label="Organisation / Réseau"
      >
        <FormInput
          type="text"
          id="organisation"
          {...register('organisation')}
        />
      </FormField>

      {/* Description */}
      <FormField
        className="sm:col-span-full"
        name="description"
        label="Description"
      >
        <FormTextarea
          id="description"
          {...register('description')}
        />
      </FormField>

      {/* Adresse */}
      <FormField
        className="sm:col-span-full"
        name="adresse"
        required
        label="Adresse complète"
        error={errors.adresse && "L'adresse est requise."}
      >
        <FormInput
          type="text"
          id="adresse"
          error={!!errors.adresse}
          {...register('adresse', { required: true })}
        />
        <p className="mt-1 text-xs text-gray-400">
          L&apo;adresse est utilisée pour l&apo;affichage dans l&apo;annuaire ET pour
          calculer automatiquement les coordonnées GPS de la carte.
        </p>
      </FormField>

      {/* Email + Téléphone sur la même ligne */}
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

      <FormField
        className="sm:col-span-2"
        name="tel"
        label="Téléphone"
      >
        <FormInput
          type="tel"
          id="tel"
          {...register('tel')}
        />
      </FormField>

      {/* Site web */}
      <FormField
        className="sm:col-span-full"
        name="siteWeb"
        label="Site web"
      >
        <FormInput
          type="url"
          id="siteWeb"
          placeholder="https://..."
          {...register('siteWeb')}
        />
      </FormField>

      {/* Boutons */}
      <div className="sm:col-span-full flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
        {/* Sauvegarder en brouillon */}
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

        {/* Publier — seulement en mode édition */}
        {onPublish && (
          <button
            type="button"
            onClick={handlePublishClick}
            className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Publier sur le site
          </button>
        )}

        {/* Annuler */}
        <Link
          href={backHref}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
        >
          Annuler
        </Link>
      </div>
    </form>
  )
}
