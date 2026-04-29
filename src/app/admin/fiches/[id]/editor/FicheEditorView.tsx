'use client'

import { useState, useEffect } from 'react'
import { useEditor as useEditorCtx } from '@/components/admin/editor/EditorContext'
import { EditableField } from '@/components/admin/editor/EditableField'
import { HeaderFiche } from '@/components/Layout/HeaderFiche'
import { Container } from '@/components/Layout/Container'
import { Prose } from '@/components/Prose'
import { Box } from '@/components/Layout/Box'
import { categories } from '@/data/categories'
import { listLiens } from '@/services/contentful-management'

// ─── Définitions de TOUS les champs éditables ────────────────────────────────

const FICHE_FIELDS = {
  titre: {
    key: 'titre', label: 'Titre', type: 'text' as const,
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
  description: {
    key: 'description',
    label: 'Description courte',
    type: 'textarea' as const,
    maxLength: 280,
    hint: 'Max 280 caractères.',
  },
  tags: {
    key: 'tags',
    label: 'Tags',
    type: 'tags' as const,
    hint: 'Ajoutez, supprimez et organisez les mots-clés de la fiche.',
  },
  resume: {
    key: 'resume',
    label: 'Résumé',
    type: 'richtext' as const,
    hint: 'S\'affiche en premier sur la fiche.',
  },
  contenu: {
    key: 'contenu',
    label: 'Contenu détaillé',
    type: 'richtext' as const,
    hint: 'Affiché après le résumé.',
  },
  typeDispositif: {
    key: 'typeDispositif',
    label: 'Types de dispositif',
    type: 'checkboxGroup' as const,
    options: [
      'Accompagnement MNA', "Association d'aide aux migrants",
      'Association LGBTQIA+',
      'Associations caritatives - Distribution Alimentaire',
      "Associations d'accompagnement personnes en situation de prostitution",
      'CAARUD', 'CADA', 'CAES', 'CD', 'CEGIDD', 'Centre de vaccination',
      'COREVIH', 'CPH', 'CPTS', 'CSAPA', 'Filières gérontologiques',
      'HUDA', 'MDPH', 'MSP', 'OFII', 'PASS', 'PRAHDA', 'Préfecture',
      'Réseaux polyvalents (tous âges et toutes pathologies)', 'SIAO', 'SPADA',
    ].map((t) => ({ value: t, label: t })),
  },
  illustrationUrl: {
    key: 'illustrationUrl',
    label: 'Illustration',
    type: 'image' as const,
    hint: 'Image principale (obligatoire).',
  },
  outilsIds: {
    key: 'outilsIds',
    label: 'Quelques outils',
    type: 'liens' as const,
  },
  patientsIds: {
    key: 'patientsIds',
    label: 'Pour les patients',
    type: 'liens' as const,
  },
  pourEnSavoirPlusIds: {
    key: 'pourEnSavoirPlusIds',
    label: 'Pour aller plus loin',
    type: 'liens' as const,
  },
}

// ─── Composant principal ──────────────────────────────────────────────────────

type Props = { ficheId: string }

// ─── Composants utilitaires ───────────────────────────────────────────────────
function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-blue-50 my-4">
      <p className="text-blue-400 italic text-sm">{label}</p>
    </div>
  )
}

function LienBloc({
  title,
  liens,
  isEmpty,
  emptyLabel,
}: {
  title: string
  liens: any[]
  isEmpty: boolean
  emptyLabel: string
}) {
  if (isEmpty) {
    return (
      <Box title={title}>
        <p className="text-gray-400 italic text-xs py-2">{emptyLabel}</p>
      </Box>
    )
  }
  return (
    <Box title={title}>
      {liens.map((lien: any) => (
        <a
          key={lien.id}
          href={lien.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-default py-3 block hover:text-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          {lien.titre}
        </a>
      ))}
    </Box>
  )
}

export function FicheEditorView({ ficheId: _ficheId }: Props) {
  const { values, clearSelection } = useEditorCtx()
  const [showDetails] = useState(true)
  const [allLiens, setAllLiens] = useState<any[]>([])

  const typeDispositif = values.typeDispositif || []

  // Charge tous les liens disponibles (pour les blocs latéraux)
  useEffect(() => {
    listLiens().then(setAllLiens)
  }, [])

  const categorie = values.categorie && categories[values.categorie as keyof typeof categories]
    ? categories[values.categorie as keyof typeof categories]
    : categories.sante

  const tags = Array.isArray(values.tags) ? values.tags : []

  const fichePreview = {
    titre: values.titre ?? '',
    categorie: values.categorie ?? 'sante',
    updatedAt: new Date().toISOString(),
    illustration: values.illustrationUrl
    ? {
        title: 'illustration',
        file: {
          url: values.illustrationUrl.includes('?')
          ? values.illustrationUrl
          : `${values.illustrationUrl}?w=1200&q=80`,

          contentType: 'image/jpeg',
          details: { image: { width: 400, height: 400 } },
        },
      }
    : undefined,
  }

  // Résout les IDs de liens en objets pour l'affichage
  const resolveLinks = (ids: string[]) =>
    ids
      .map((id) => allLiens.find((l: any) => l.id === id))
      .filter(Boolean)

  const outils = resolveLinks(values.outilsIds ?? [])
  const patients = resolveLinks(values.patientsIds ?? [])
  const pourEnSavoirPlus = resolveLinks(values.pourEnSavoirPlusIds ?? [])

  return (
    <div className="bg-white min-h-full" 
      onClick={clearSelection}
      style={{ '--preview-mode': '1' } as React.CSSProperties}
    >

      {/* ── HEADER — identique au site public ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          const target = e.target as HTMLElement
          const anchor = target.closest('a')
          if (anchor) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        onKeyDown={() => {}}
      >
        <HeaderFiche fiche={fichePreview as any} categorie={categorie} />
      </div>

    <div className="bg-slate-50 border-b border-gray-200">
      <Container>
        <div className="py-3 flex items-center gap-3">
          <EditableField field={FICHE_FIELDS.categorie} as="span">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {categorie?.name ?? values.categorie ?? 'Catégorie non définie'}
              <span className="text-[10px] opacity-60">✏️</span>
            </button>
          </EditableField>
        </div>
      </Container>
    </div>

    {/* Zone illustration — visible dès l'ouverture, bien proportionnée */}
    <EditableField field={FICHE_FIELDS.illustrationUrl} as="div">
      <div className="relative group cursor-pointer">
        {values.illustrationUrl ? (
          <>
            <img
              src={values.illustrationUrl}
              alt="Illustration de la fiche"
              className="w-full object-cover"
              style={{ maxHeight: 280, minHeight: 140 }}
            />
            {/* Overlay au survol — toujours visible en mode édition */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
              transition-all flex items-center justify-center"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity
                bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-full
                shadow-lg flex items-center gap-2"
              >
                🖼 Modifier l&apos;illustration
              </span>
            </div>
            {/* Badge permanent en haut à droite */}
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs
              px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span>✏️</span> Illustration
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-14
            bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed
            border-blue-300 rounded-xl mx-6 my-4">
            <span className="text-5xl">🖼</span>
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-700">
                Ajouter une illustration
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Obligatoire — visible sur la fiche et dans les listes
              </p>
            </div>
          </div>
        )}
      </div>
    </EditableField>

      <div className="relative pb-12">
        <Container>

          {/* ── TITRE ── */}
          <div className="w-full py-10 lg:py-20">
            <EditableField field={FICHE_FIELDS.titre} as="button" className="w-full text-left">
              <h1 className="mt-10 lg:mt-0 text-3xl md:text-5xl lg:text-6xl text-blue-default">
                {values.titre || (
                  <span className="italic text-gray-300 text-3xl">
                    Cliquez pour définir le titre
                  </span>
                )}
              </h1>
            </EditableField>
          </div>
          {/* ── MÉTADONNÉES — Tags + Types de dispositif ── */}
          <div className="flex flex-wrap gap-8">
            <Container>
              {/* ── BARRE MÉTADONNÉES — sous le titre, avant le contenu ── */}
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-3 flex
                flex-wrap gap-4"
              >

                {/* Tags */}
                <EditableField field={FICHE_FIELDS.tags} as="div">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(values.tags) ? values.tags : []).length > 0
                        ? (Array.isArray(values.tags) ? values.tags : []).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5
                              rounded-full"
                          >
                            {tag}
                          </span>
                        ))
                        : (
                          <span className="text-xs text-blue-400 border border-dashed
                            border-blue-300 px-2 py-0.5 rounded-full"
                          >
                            + Ajouter des tags
                          </span>
                        )
                      }
                    </div>
                  </div>
                </EditableField>

                {/* Types de dispositif */}
                <EditableField field={FICHE_FIELDS.typeDispositif} as="div">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dispositifs</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(values.typeDispositif?.length > 0)
                        ? values.typeDispositif.slice(0, 3).map((t: string) => (
                          <span
                            key={t}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5
                              rounded-full border border-blue-200"
                          >
                            {t}
                          </span>
                        ))
                        : (
                          <span className="text-xs text-blue-400 border border-dashed
                            border-blue-300 px-2 py-0.5 rounded-full"
                          >
                            + Sélectionner
                          </span>
                        )
                      }
                      {values.typeDispositif?.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{values.typeDispositif.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </EditableField>

              </div>
            </Container>
          </div>
          <div className="flex lg:-mx-4 flex-wrap">

            {/* ── COLONNE PRINCIPALE ── */}
            <div className="w-full print:w-full lg:w-8/12 lg:px-4 pb-10 lg:pb-20">

              {/* RÉSUMÉ */}
              <EditableField field={FICHE_FIELDS.resume} className="block">
                {values.resume ? (
                  <Prose html={values.resume} />
                ) : (
                  <EmptyBlock label="Cliquez pour rédiger le résumé" />
                )}
              </EditableField>

              {/* Le bouton toggle n'est pas utile en édition — on affiche tout */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400 px-2">Contenu détaillé</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* CONTENU DÉTAILLÉ */}
              {showDetails && (
                <EditableField field={FICHE_FIELDS.contenu} className="block">
                  {values.contenu ? (
                    <Prose html={values.contenu} />
                  ) : (
                    <EmptyBlock label="Cliquez pour rédiger le contenu détaillé" />
                  )}
                </EditableField>
              )}
            </div>

            {/* ── COLONNE LATÉRALE — identique au site public ── */}
            <div className="w-full lg:w-4/12 lg:px-4 print:hidden space-y-10">

              {/* QUELQUES OUTILS */}
              <EditableField field={FICHE_FIELDS.outilsIds} className="block">
                <LienBloc
                  title="Quelques outils"
                  liens={outils}
                  isEmpty={outils.length === 0}
                  emptyLabel="Cliquez pour ajouter des outils"
                />
              </EditableField>

              {/* POUR LES PATIENTS */}
              <EditableField field={FICHE_FIELDS.patientsIds} className="block">
                <LienBloc
                  title="Pour les patients"
                  liens={patients}
                  isEmpty={patients.length === 0}
                  emptyLabel="Cliquez pour ajouter des liens patients"
                />
              </EditableField>

              {/* POUR ALLER PLUS LOIN */}
              <EditableField field={FICHE_FIELDS.pourEnSavoirPlusIds} className="block">
                <LienBloc
                  title="Pour aller plus loin"
                  liens={pourEnSavoirPlus}
                  isEmpty={pourEnSavoirPlus.length === 0}
                  emptyLabel="Cliquez pour ajouter des ressources"
                />
              </EditableField>

            </div>
          </div>
        </Container>
      </div>

      {/* ── BARRE D'INFO BAS DE PAGE ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 text-white text-xs py-2 text-center select-none z-40">
        ✏️ Mode édition — Cliquez sur un élément pour le modifier dans le panneau latéral
      </div>
    </div>
  )
}
