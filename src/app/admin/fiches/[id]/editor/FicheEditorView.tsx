'use client'

import { useState, useEffect } from 'react'
import { not } from 'ramda'
import { useEditor as useEditorCtx } from '@/components/admin/editor/EditorContext'
import { EditableField } from '@/components/admin/editor/EditableField'
import { HeaderFiche } from '@/components/Layout/HeaderFiche'
import { Container } from '@/components/Layout/Container'
import { FloatingButtons } from '@/components/FloatingButtons'
import { Prose } from '@/components/Prose'
import { SecondaryButton } from '@/components/Buttons'
import { StructuresList } from '@/components/Map/StructuresList'
import { Box } from '@/components/Layout/Box'
import { Link } from '@/components/Links'
import { categories } from '@/data/categories'
import { getStructuresByTypes, listLiens } from '@/services/contentful-management'

// ─── Définitions de TOUS les champs éditables ────────────────────────────────

const FICHE_FIELDS = {
  titre: {
    key: 'titre',
    label: 'Titre',
    type: 'text' as const,
    hint: 'Titre principal affiché sur la fiche.',
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
  slug: {
    key: 'slug',
    label: 'Slug (URL)',
    type: 'text' as const,
    hint: 'Identifiant dans l\'URL. Exemple : acces-aux-soins. Minuscules et tirets uniquement.',
  },
  description: {
    key: 'description',
    label: 'Description courte',
    type: 'textarea' as const,
    maxLength: 280,
    hint: 'Max 280 caractères. Affiché dans les listes et la recherche.',
  },
  tags: {
    key: 'tags',
    label: 'Tags',
    type: 'text' as const,
    hint: 'Séparés par des virgules. Ex : migrants, SDF, PASS',
  },
  resume: {
    key: 'resume',
    label: 'Résumé',
    type: 'richtext' as const,
    hint: 'Affiché dès l\'ouverture de la fiche.',
  },
  contenu: {
    key: 'contenu',
    label: 'Contenu détaillé',
    type: 'richtext' as const,
    hint: 'Affiché après "Afficher les détails".',
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
    hint: 'Détermine les structures liées affichées sur la carte.',
  },
  illustrationUrl: {
    key: 'illustrationUrl',
    label: 'Illustration',
    type: 'image' as const,
    hint: 'Image principale de la fiche (obligatoire).',
  },
  outilsIds: {
    key: 'outilsIds',
    label: 'Quelques outils',
    type: 'liens' as const,
    hint: 'Liens affichés dans le bloc "Quelques outils".',
  },
  patientsIds: {
    key: 'patientsIds',
    label: 'Pour les patients',
    type: 'liens' as const,
    hint: 'Liens affichés dans le bloc "Pour les patients".',
  },
  pourEnSavoirPlusIds: {
    key: 'pourEnSavoirPlusIds',
    label: 'Pour aller plus loin',
    type: 'liens' as const,
    hint: 'Liens affichés dans le bloc "Pour aller plus loin".',
  },
}

// ─── Composant principal ──────────────────────────────────────────────────────

type Props = { ficheId: string }

export function FicheEditorView({ ficheId }: Props) {
  const { values, clearSelection, updateValue } = useEditorCtx()
  const [showDetails, setShowDetails] = useState(false)
  const [structures, setStructures] = useState<any[]>([])
  const [allLiens, setAllLiens] = useState<any[]>([])

  // Charge les structures liées selon typeDispositif
  const typeDispositif = Array.isArray(values.typeDispositif) ? values.typeDispositif : []
  useEffect(() => {
    if (typeDispositif.length > 0) {
      getStructuresByTypes(typeDispositif).then(setStructures)
    } else {
      setStructures([])
    }
  }, [JSON.stringify(typeDispositif)])

  // Charge tous les liens disponibles (pour les blocs latéraux)
  useEffect(() => {
    listLiens().then(setAllLiens)
  }, [])

  const categorie = values.categorie && categories[values.categorie as keyof typeof categories]
    ? categories[values.categorie as keyof typeof categories]
    : categories.sante

  const tags = typeof values.tags === 'string'
    ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : []

  const fichePreview = {
    titre: values.titre ?? '',
    categorie: values.categorie ?? 'sante',
    updatedAt: new Date().toISOString(),
    illustration: values.illustrationUrl
    ? {
        title: 'illustration',
        file: {
          url: values.illustrationUrl.replace('https:', ''),
          contentType: 'image/jpeg',
          details: { image: { width: 800, height: 600 } },
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
    <div className="bg-white min-h-full" onClick={clearSelection}>

      {/* ── HEADER — identique au site public ── */}
      <HeaderFiche fiche={fichePreview as any} categorie={categorie} />

      {!values.illustrationUrl && (
        <EditableField field={FICHE_FIELDS.illustrationUrl} as="div">
          <div className="bg-gray-100 text-center py-8 text-gray-400 text-sm">
            🖼 Cliquez pour ajouter l'illustration (obligatoire)
          </div>
        </EditableField>
      )}

      <div className="relative pb-12">
        <Container>
          <FloatingButtons className="absolute top-5 2xl:top-20 xl:left-8" />

          {/* ── TITRE ── */}
          <div className="w-full py-10 lg:py-20">
            <EditableField field={FICHE_FIELDS.titre}>
              <h1 className="mt-10 lg:mt-0 text-3xl md:text-5xl lg:text-6xl text-blue-default">
                {values.titre || (
                  <span className="italic text-gray-300 text-3xl">
                    Cliquez pour définir le titre
                  </span>
                )}
              </h1>
            </EditableField>
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

              <SecondaryButton
                type="button"
                className="print:hidden block my-5 w-1/2 mx-auto"
                onClick={(e) => { e.stopPropagation(); setShowDetails(not) }}
              >
                {showDetails ? 'Masquer les détails' : 'Afficher les détails'}
              </SecondaryButton>

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

            {/* ── CARTE STRUCTURES ── */}
            <div className="w-full mt-10">
              {structures.length > 0
                ? <StructuresList structures={structures} />
                : typeDispositif.length > 0
                  ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center text-sm text-gray-400">
                      Aucune structure dans l'environnement{' '}
                      <strong>{process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT}</strong>{' '}
                      pour ces types de dispositif.
                    </div>
                  )
                  : null
              }
            </div>
          </div>
        </Container>
      </div>

      {/* ── BARRE D'INFO BAS DE PAGE ── */}
      <div
        className="fixed bottom-0 left-0 right-0 text-white text-xs py-2 text-center select-none"
        style={{ background: 'rgba(17,24,39,0.9)', zIndex: 40 }}
      >
        ✏️ Mode édition — Cliquez sur un élément pour le modifier dans le panneau latéral
      </div>
    </div>
  )
}

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
