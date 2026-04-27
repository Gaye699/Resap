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
    type: 'text' as const,
    hint: 'Séparés par des virgules.',
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

export function FicheEditorView({ ficheId: _ficheId }: Props) {
  const { values, clearSelection } = useEditorCtx()
  const [showDetails] = useState(true)
  const [allLiens, setAllLiens] = useState<any[]>([])

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
          url: `${values.illustrationUrl.replace('https:', '')}?w=400&q=400`,
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
    <div className="bg-white min-h-full" onClick={clearSelection}>

      {/* ── HEADER — identique au site public ── */}
      <div
        onClick={(e) => {
          // Bloque les <a> et <Link> à l'intérieur du header
          const target = e.target as HTMLElement
          const anchor = target.closest('a')
          if (anchor) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        <HeaderFiche fiche={fichePreview as any} categorie={categorie} />
      </div>

      <div style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
      <Container>
        <div className="py-3 flex items-center gap-3">
          <EditableField field={FICHE_FIELDS.categorie} as="span">
            <span
              className="inline-flex items-center gap-1.5 text-sm font-medium
                px-3 py-1 rounded-full cursor-pointer"
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
              }}
            >
              {categorie?.name ?? values.categorie ?? 'Catégorie non définie'}
              <span style={{ fontSize: 10, opacity: 0.6 }}>✏️</span>
            </span>
          </EditableField>
        </div>
      </Container>
    </div>

      {/* Zone illustration — toujours visible, cliquable pour changer */}
      <EditableField field={FICHE_FIELDS.illustrationUrl} as="div">
        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            minHeight: 80,
          }}
        >
          {values.illustrationUrl ? (
            // Image existante — overlay "Changer" visible
            <div style={{ position: 'relative' }}>
              <img
                src={values.illustrationUrl}
                alt="Illustration"
                style={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0,0,0,0.55)',
                color: 'white',
                fontSize: 11,
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                🖼 Modifier l&apos;illustration
              </div>
            </div>
          ) : (
            // Aucune illustration — zone de drop visible
            <div style={{
              background: '#f0f4ff',
              border: '2px dashed #93c5fd',
              borderRadius: 8,
              padding: '32px 16px',
              textAlign: 'center',
              margin: '0 0 16px',
            }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🖼</div>
              <p style={{ fontSize: 13, color: '#3b82f6', fontWeight: 500, margin: 0 }}>
                Cliquez pour ajouter l&apos;illustration
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
                Obligatoire — image principale de la fiche
              </p>
            </div>
          )}
        </div>
      </EditableField>

      <div className="relative pb-12">
        <Container>

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
