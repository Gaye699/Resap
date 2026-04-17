'use client'

import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PrimaryButton } from '@/components/Buttons'
import { useState } from 'react'
import { AssetPicker } from '@/components/admin/editor/AssetPicker'
import { setFicheIllustration } from '@/services/contentful-management'
import { LiensPicker } from '@/components/admin/editor/LiensPicker'
import { QuickLienCreator } from '@/components/admin/QuickLienCreator'

// Tous les types de dispositif extraits de contentful.d.ts
const TYPES_DISPOSITIF = [
  'Accompagnement MNA',
  "Association d'aide aux migrants",
  'Association LGBTQIA+',
  'Associations caritatives - Distribution Alimentaire',
  "Associations d'accompagnement personnes en situation de prostitution",
  'CAARUD',
  'CADA',
  'CAES',
  'CD',
  'CEGIDD',
  'Centre de vaccination',
  'COREVIH',
  'CPH',
  'CPTS',
  'CSAPA',
  'Filières gérontologiques',
  'HUDA',
  'MDPH',
  'MSP',
  'OFII',
  'PASS',
  'PRAHDA',
  'Préfecture',
  'Réseaux polyvalents (tous âges et toutes pathologies)',
  'SIAO',
  'SPADA',
] as const

const CATEGORIES = [
  { value: 'sante', label: 'Accès à la santé' },
  { value: 'besoins-primaires', label: 'Besoins primaires' },
  { value: 'social', label: 'Social' },
  { value: 'interpretariat', label: 'Interprétariat' },
]

export type AdminFicheFields = {
  titre: string
  slug: string
  categorie: string
  description: string
  tags: string
  resume: string
  contenu: string
  typeDispositif: string[]
  outilsIds: string[]
  patientIds: string[]
  pourEnsavoirPlusIds: string[]
}

type Props = {
  ficheId?: string
  illustrationUrl?: string
  defaultValues?: Partial<AdminFicheFields>
  onSave: (data: AdminFicheFields) => Promise<void>
  onPublish?: () => Promise<void>
  backHref?: string
  isCreation?: boolean
}

export const AdminFicheForm = ({
  ficheId,
  illustrationUrl: initialIllustrationUrl,
  defaultValues,
  onSave,
  onPublish,
  backHref = '/admin/fiches',
  isCreation = false,
}: Props) => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AdminFicheFields>({ defaultValues })

  const [illustrationUrl, setIllustrationUrl] = useState(initialIllustrationUrl ?? '')
  const [showIllustrationPicker, setShowIllustrationPicker] = useState(false)
  // On observe la description pour afficher le compteur de caractères
  const descriptionValue = watch('description') ?? ''

  const onSubmit = async (data: AdminFicheFields) => {
    try {
      await onSave(data)
      toast.success(isCreation ? 'Fiche créée en brouillon.' : 'Fiche mise à jour en brouillon.')
      router.push(backHref)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur.')
    }
  }

  const handlePublishClick = async () => {
    if (!onPublish) return
    try {
      await onPublish()
      toast.success('Fiche publiée sur le site !')
      router.push(backHref)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de publication.')
    }
  }

  let submitLabel = 'Sauvegarder en brouillon'
          if (isSubmitting) {
            submitLabel = 'Sauvegarde...'
          } else if (isCreation) {
            submitLabel = 'Créer en brouillon'
          }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── Section 1 : Informations de base ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
          Informations de base
        </h2>
        <div className="space-y-5">

          {/* Titre */}
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titre"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300
                ${errors.titre ? 'border-red-400' : 'border-gray-300'}`}
              {...register('titre', { required: true })}
            />
            {errors.titre && <p className="text-red-500 text-xs mt-1">Le titre est requis.</p>}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">/fiches/categorie/</span>
              <input
                type="text"
                id="slug"
                placeholder="ex: acces-aux-soins-sans-couverture"
                className={`flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300
                  ${errors.slug ? 'border-red-400' : 'border-gray-300'}`}
                {...register('slug', {
                  required: true,
                  // Le slug ne doit contenir que des lettres minuscules, chiffres et tirets
                  pattern: { value: /^[a-z0-9-]+$/, message: 'Uniquement lettres minuscules, chiffres et tirets.' },
                })}
              />
            </div>
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message || 'Le slug est requis.'}</p>}
            <p className="text-xs text-gray-400 mt-1">Identifiant unique dans l&apos;URL. Ne peut pas être changé après publication.</p>
          </div>

          {/* Catégorie */}
          <div>
            <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              id="categorie"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300
                ${errors.categorie ? 'border-red-400' : 'border-gray-300'}`}
              {...register('categorie', { required: true })}
            >
              <option value="">Sélectionnez une catégorie</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.categorie && <p className="text-red-500 text-xs mt-1">La catégorie est requise.</p>}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              id="tags"
              placeholder="sante, acces-aux-soins, PASS"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              {...register('tags')}
            />
            <p className="text-xs text-gray-400 mt-1">Mots-clés séparés par des virgules.</p>
          </div>
        </div>
      </section>

      {/* ── Illustration ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Illustration <span className="text-red-500">*</span>
        </label>

        {illustrationUrl ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={illustrationUrl}
              alt="Illustration"
              style={{ height: 120, borderRadius: 8, border: '1px solid #e5e7eb', objectFit: 'cover' }}
            />
            <button
              type="button"
              onClick={() => setShowIllustrationPicker(true)}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Changer
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowIllustrationPicker(true)}
            style={{
              width: '100%',
              height: 80,
              border: '2px dashed #e5e7eb',
              borderRadius: 8,
              background: '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 13,
              color: '#6b7280',
              gap: 8,
            }}
          >
            <span>🖼</span> Choisir une illustration (obligatoire)
          </button>
        )}

        {showIllustrationPicker && (
          <AssetPicker
            mode="illustration"
            currentAssetUrl={illustrationUrl}
            onSelect={async (asset) => {
              setIllustrationUrl(asset.url)
              setShowIllustrationPicker(false)
              // Si la fiche existe déjà, on peut lier l'asset immédiatement
              if (ficheId) {
                try {
                  await setFicheIllustration(ficheId, asset.id)
                } catch {
                  // Sera sauvegardé dans le prochain save
                }
              }
            }}
            onClose={() => setShowIllustrationPicker(false)}
          />
        )}
      </div>
      {/* ── Section 2 : Description courte ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
          Description courte
        </h2>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            {/* Compteur de caractères */}
            <span className={`text-xs ${descriptionValue.length > 280 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              {descriptionValue.length} / 280
            </span>
          </div>
          <textarea
            rows={3}
            id="description"
            placeholder="Courte description de la fiche, visible dans les listes et la recherche..."
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300
              ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
            {...register('description', {
              required: true,
              maxLength: { value: 280, message: 'Maximum 280 caractères.' },
            })}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message || 'La description est requise.'}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            S&apos;affiche dans les listes et les résultats de recherche.
          </p>
        </div>
      </section>

      {/* ── Section 3 : Contenu riche ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-1 pb-2 border-b border-gray-100">
          Contenu
        </h2>
        <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-md mb-4">
          💡 Ces champs acceptent la syntaxe <strong>Markdown</strong> : **gras**, *italique*, # Titre, - liste, [lien](url), etc.
          Le rendu final est géré par le site public.
        </p>

        <div className="space-y-5">
          {/* Résumé */}
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
              Résumé <span className="text-gray-400 font-normal">(s&apos;affiche en premier sur la fiche)</span>
            </label>
            <textarea
              rows={6}
              id="resume"
              placeholder="Résumé de la fiche en Markdown..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
              {...register('resume')}
            />
          </div>

          {/* Contenu principal */}
          <div>
            <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 mb-1">
              Contenu principal
            </label>
            <textarea
              rows={12}
              id="contenu"
              placeholder="Contenu détaillé de la fiche en Markdown..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
              {...register('contenu')}
            />
          </div>
        </div>
      </section>

      {/* ── Section 4 : Types de dispositif ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-1 pb-2 border-b border-gray-100">
          Types de dispositif <span className="text-red-500">*</span>
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Cochez tous les types de dispositif auxquels cette fiche s&apos;applique.
        </p>

        {/* Grille de cases à cocher — plus lisible que Contentful */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TYPES_DISPOSITIF.map((type) => (
            <label
              key={type}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                value={type}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                {...register('typeDispositif')}
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>

        {errors.typeDispositif && (
          <p className="text-red-500 text-xs mt-2">Sélectionnez au moins un type.</p>
        )}
      </section>

      {/* ── Section : Liens associés ── */}
      <section className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Liens associés</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Ces liens s&apos;affichent dans la colonne latérale de la fiche sur le site public.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Bloc : Pour aller plus loin */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Pour aller plus loin</p>
                <p className="text-xs text-gray-400">Ressources complémentaires</p>
              </div>
            </div>
            <Controller
              name="pourEnSavoirPlusIds"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <LiensPicker
                  titre="Pour aller plus loin"
                  selectedIds={field.value ?? []}
                  onChange={field.onChange}
                  ficheId={ficheId}
                  bloc="pourEnSavoirPlus"
                />
              )}
            />
          </div>

          {/* Bloc : Quelques outils */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-800">Quelques outils</p>
            </div>
            <Controller
              name="outilsIds"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <LiensPicker
                  titre="Quelques outils"
                  selectedIds={field.value ?? []}
                  onChange={field.onChange}
                  ficheId={ficheId}
                  bloc="outils"
                />
              )}
            />
          </div>

          {/* Bloc : Pour les patients */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-800">Pour les patients</p>
            </div>
            <Controller
              name="patientsIds"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <LiensPicker
                  titre="Pour les patients"
                  selectedIds={field.value ?? []}
                  onChange={field.onChange}
                  ficheId={ficheId}
                  bloc="patients"
                />
              )}
            />
          </div>
        </div>
      </section>

      {/* ── Boutons d'action ── */}
      <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
        <PrimaryButton type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-6 py-2.5">
          {isSubmitting && (
            <span className="-ml-1 mr-2 w-4 h-4 border-2 border-transparent border-l-white rounded-full animate-spin" />
          )}
          {submitLabel}
        </PrimaryButton>

        {onPublish && (
          <button
            type="button"
            onClick={handlePublishClick}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Publier sur le site
          </button>
        )}

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
