'use client'

import { useEditor as useEditorCtx } from '@/components/admin/editor/EditorContext'
import { EditableField } from '@/components/admin/editor/EditableField'
import { categories } from '@/data/categories'
import { useEffect, useState } from 'react'
import { getStructuresByTypes } from '@/services/contentful-management'
import dynamic from 'next/dynamic'

// La carte Leaflet ne fonctionne pas en SSR → import dynamique
const EditorMap = dynamic(() => import('./EditorMap'), { ssr: false })

// Définition des champs — on change 'markdown' en 'richtext' pour resume et contenu
const FICHE_FIELDS = {
  titre: {
    key: 'titre',
    label: 'Titre de la fiche',
    type: 'text' as const,
    hint: 'Titre principal affiché en grand sur la fiche.',
  },
  description: {
    key: 'description',
    label: 'Description courte',
    type: 'textarea' as const,
    maxLength: 280,
    hint: 'Maximum 280 caractères. S\'affiche dans les listes et la recherche.',
  },
  categorie: {
    key: 'categorie',
    label: 'Catégorie',
    type: 'select' as const,
    options: [
      { value: 'sante', label: 'Accès à la santé' },
      { value: 'besoins-primaires', label: 'Besoins primaires' },
      { value: 'social', label: 'Social' },
      { value: 'interpretariat', label: 'Interprétariat' },
    ],
  },
  tags: {
    key: 'tags',
    label: 'Tags',
    type: 'text' as const,
    hint: 'Séparés par des virgules.',
  },
  resume: {
    key: 'resume',
    label: 'Résumé',
    type: 'markdown' as const,
    hint: 'S\'affiche dès l\'ouverture de la fiche.',
  },
  contenu: {
    key: 'contenu',
    label: 'Contenu détaillé',
    type: 'markdown' as const,
    hint: 'Affiché après "Afficher les détails".',
  },
  typeDispositif: {
    key: 'typeDispositif',
    label: 'Types de dispositif',
    type: 'checkboxGroup' as const,
    options: [
      'Accompagnement MNA', "Association d'aide aux migrants", 'Association LGBTQIA+',
      'Associations caritatives - Distribution Alimentaire',
      "Associations d'accompagnement personnes en situation de prostitution",
      'CAARUD', 'CADA', 'CAES', 'CD', 'CEGIDD', 'Centre de vaccination',
      'COREVIH', 'CPH', 'CPTS', 'CSAPA', 'Filières gérontologiques',
      'HUDA', 'MDPH', 'MSP', 'OFII', 'PASS', 'PRAHDA', 'Préfecture',
      'Réseaux polyvalents (tous âges et toutes pathologies)', 'SIAO', 'SPADA',
    ].map((t) => ({ value: t, label: t })),
    hint: 'Détermine quelles structures apparaissent sous la fiche.',
  },
}

export function FicheEditorView() {
  const { values } = useEditorCtx()
  const [showDetails, setShowDetails] = useState(false)
  const [structures, setStructures] = useState<any[]>([])

  const categorie = values.categorie
    ? categories[values.categorie as keyof typeof categories]
    : null
  const typeDispositifValue = values.typeDispositif as string[] | undefined ?? []
  // Charge les structures liées aux typeDispositif en temps réel
useEffect(() => {
    if (typeDispositifValue?.length > 0) {
      getStructuresByTypes(typeDispositifValue).then(setStructures)
    } else {
      setStructures([])
    }
  }, [typeDispositifValue])

  return (
    <div
      className="min-h-full bg-white"
    >
      {/* ─── BANDEAU CATÉGORIE  ─── */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
        <EditableField field={FICHE_FIELDS.categorie} as="span">
          <span
            className="inline-flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1 rounded-full"
            style={{ background: categorie?.bgColor ?? '#3b7a57' }}
          >
            {categorie?.name ?? values.categorie ?? 'Catégorie'}
          </span>
        </EditableField>
        <span>Dernière mise à jour : aujourd&apos;hui</span>
      </div>

      {/* ─── TITRE PRINCIPAL (comme sur le site) ─── */}
      <div className="px-6 pt-8 pb-4 max-w-5xl mx-auto">
        {/* Boutons flottants print/share (décoratifs) */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex gap-2 mt-1">
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-500 cursor-not-allowed">🖨</div>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-500 cursor-not-allowed">↗</div>
          </div>

          <EditableField field={FICHE_FIELDS.titre} className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold text-blue-900 leading-tight">
              {values.titre || <span className="italic text-gray-300">Titre non défini</span>}
            </h1>
          </EditableField>
        </div>

        {/* Tags */}
        {values.tags && (
          <EditableField field={FICHE_FIELDS.tags} className="mb-6" as="div">
            <div className="flex flex-wrap gap-2">
              {values.tags.split(',').map((t: string) => t.trim()).filter(Boolean).map((tag: string) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </EditableField>
        )}
      </div>

      {/* ─── CORPS : 2 colonnes comme le site ─── */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex gap-8 flex-wrap lg:flex-nowrap">

          {/* Colonne principale (8/12) */}
          <div className="w-full lg:w-8/12">

            {/* RÉSUMÉ — cliquable, rendu HTML direct */}
            <EditableField field={FICHE_FIELDS.resume} className="mb-6">
              {values.resume ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: values.resume }}
                />
                ) : (
                  <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-blue-50">
                    <p className="text-blue-400 italic text-sm">
                      ✏️ Cliquez ici pour rédiger le résumé
                    </p>
                  </div>
                )}
            </EditableField>

            {/* Bouton "Afficher les détails" — identique au site */}
            <div className="flex justify-center my-6">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails) }}
                className="px-8 py-2 border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
              >
                {showDetails ? 'Masquer les détails' : 'Afficher les détails'}
              </button>
            </div>

            {/* CONTENU DÉTAILLÉ — visible si showDetails */}
            {showDetails && (
              <EditableField field={FICHE_FIELDS.contenu} className="mb-6">
                {values.contenu ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: values.contenu }}
                  />
                  )
                  : (
                    <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-blue-50">
                      <p className="text-blue-400 italic text-sm">
                        ✏️ Cliquez ici pour rédiger le contenu détaillé
                      </p>
                    </div>
                  )}
              </EditableField>
            )}
          </div>

          {/* Colonne latérale (4/12) — identique au vrai site */}
          <div className="w-full lg:w-4/12 space-y-6 print:hidden">

            {/* Types de dispositif (éditable) */}
            <EditableField
              field={FICHE_FIELDS.typeDispositif}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Types de dispositif
              </h3>
              {values.typeDispositif?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {(values.typeDispositif as string[]).map((t) => (
                    <span key={t} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100">
                      {t}
                    </span>
                  ))}
                </div>
                )
                : (
                  <p className="text-xs text-gray-400 italic">
                    ✏️ Cliquez pour sélectionner les types
                  </p>
                )}
            </EditableField>

            {/* Description (éditable) */}
            <EditableField
              field={FICHE_FIELDS.description}
              className="bg-gray-50 border border-gray-200 rounded-xl p-5"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {values.description || <span className="italic text-gray-300">Non définie</span>}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {(values.description ?? '').length}/280 caractères
              </p>
            </EditableField>

          </div>
        </div>

        {/* ─── CARTE + STRUCTURES (comme sur le site) ─── */}
        {structures.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Structures liées ({structures.length})
            </h2>
            <EditorMap structures={structures} />
          </div>
        )}
        {structures.length === 0 && values.typeDispositif?.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-400">
            Aucune structure trouvée pour ces types de dispositif dans l&apos;environnement{' '}
            <strong>{process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT}</strong>.
          </div>
        )}
      </div>

      {/* Bandeau bas mode édition */}
      <div
        className="fixed bottom-0 left-0 right-0 text-white text-xs py-2 text-center"
        style={{ background: 'rgba(17, 24, 39, 0.95)', zIndex: 40 }}
      >
        🖊️ Mode édition — Cliquez sur n&apos;importe quel élément pour le modifier dans le panneau latéral
      </div>
    </div>
  )
}
