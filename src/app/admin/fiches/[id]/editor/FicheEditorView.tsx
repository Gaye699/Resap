'use client'

import { useState } from 'react'
import { useEditor as useEditorCtx } from '@/components/admin/editor/EditorContext'
import { EditableField } from '@/components/admin/editor/EditableField'
import { Box } from '@/components/Layout/Box'
import { Container } from '@/components/Layout/Container'
import { HeaderFiche } from '@/components/Layout/HeaderFiche'
import { Prose } from '@/components/Prose'
import { categories } from '@/data/categories'

const FICHE_FIELDS = {
  titre: {
    key: 'titre',
    label: 'Titre',
    type: 'text' as const,
  },
  categorie: {
    key: 'categorie',
    label: 'Categorie',
    type: 'select' as const,
    options: [
      { value: 'sante', label: 'Acces a la sante' },
      { value: 'besoins-primaires', label: 'Besoins primaires' },
      { value: 'social', label: 'Social' },
      { value: 'interpretariat', label: 'Interpretariat' },
    ],
  },
  description: {
    key: 'description',
    label: 'Description courte',
    type: 'textarea' as const,
    maxLength: 280,
    hint: 'Max 280 caracteres.',
  },
  tags: {
    key: 'tags',
    label: 'Tags',
    type: 'tags' as const,
    hint: 'Ajoutez, supprimez et organisez les mots-cles de la fiche.',
  },
  resume: {
    key: 'resume',
    label: 'Resume',
    type: 'richtext' as const,
    hint: "S'affiche en premier sur la fiche.",
  },
  contenu: {
    key: 'contenu',
    label: 'Contenu detaille',
    type: 'richtext' as const,
    hint: 'Affiche apres le resume.',
  },
  typeDispositif: {
    key: 'typeDispositif',
    label: 'Types de dispositif',
    type: 'checkboxGroup' as const,
    options: [
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
      'Filieres gerontologiques',
      'HUDA',
      'MDPH',
      'MSP',
      'OFII',
      'PASS',
      'PRAHDA',
      'Prefecture',
      'Reseaux polyvalents (tous ages et toutes pathologies)',
      'SIAO',
      'SPADA',
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

type Props = { ficheId: string }

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="my-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-8 text-center">
      <p className="text-sm italic text-blue-400">{label}</p>
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
        <p className="py-2 text-xs italic text-gray-400">{emptyLabel}</p>
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
          className="block py-3 text-blue-default hover:text-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          {lien.titre}
        </a>
      ))}
    </Box>
  )
}

export function FicheEditorView({ ficheId: _ficheId }: Props) {
  const { values, clearSelection, allLiens } = useEditorCtx()
  const [showDetails] = useState(true)

  const typeDispositif = Array.isArray(values.typeDispositif) ? values.typeDispositif : []
  const tags = Array.isArray(values.tags) ? values.tags : []

  const categorie = values.categorie && categories[values.categorie as keyof typeof categories]
    ? categories[values.categorie as keyof typeof categories]
    : categories.sante

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

  const resolveLinks = (ids: string[]) =>
    ids
      .map((id) => allLiens.find((l: any) => l.id === id))
      .filter(Boolean)

  const outils = resolveLinks(values.outilsIds ?? [])
  const patients = resolveLinks(values.patientsIds ?? [])
  const pourEnSavoirPlus = resolveLinks(values.pourEnSavoirPlusIds ?? [])

  return (
    <div
      className="min-h-full bg-white"
      onClick={clearSelection}
      style={{ '--preview-mode': '1' } as React.CSSProperties}
    >
      <EditableField field={FICHE_FIELDS.categorie} as="div">
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            const anchor = (e.target as HTMLElement).closest('a')
            if (anchor) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              const anchor = (e.target as HTMLElement).closest('a')
              if (anchor) {
                e.preventDefault()
                e.stopPropagation()
              }
            }
          }}
        >
          <HeaderFiche fiche={fichePreview as any} categorie={categorie} />
        </div>
      </EditableField>

      <Container>
        <div className="relative pt-8 pb-12 lg:pt-10">
          <EditableField
            field={FICHE_FIELDS.illustrationUrl}
            as="div"
            className="inline-block"
            borderRadius={16}
          >
            <div className="group relative inline-block cursor-pointer">
              {values.illustrationUrl ? (
                <div className="relative h-48 w-48 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                  <img
                    src={values.illustrationUrl}
                    alt="Illustration de la fiche"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 transition-all group-hover:bg-black/40">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-800 opacity-0 shadow transition-opacity group-hover:opacity-100">
                      Modifier
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-100">
                  <span className="text-3xl">+</span>
                  <p className="px-2 text-center text-xs font-semibold text-blue-700">
                    Ajouter une illustration
                  </p>
                </div>
              )}
            </div>
          </EditableField>

          <div className="w-full py-6 lg:py-10">
            <EditableField field={FICHE_FIELDS.titre} className="block">
              <h1 className="mt-2 text-3xl text-blue-default md:text-5xl lg:mt-0 lg:text-6xl">
                {values.titre || (
                  <span className="italic text-gray-300">Cliquez pour ajouter un titre</span>
                )}
              </h1>
            </EditableField>

            <EditableField field={FICHE_FIELDS.description} className="mt-4 block">
              {values.description ? (
                <p className="max-w-3xl text-sm leading-relaxed text-gray-600 md:text-base">
                  {values.description}
                </p>
              ) : (
                <p className="max-w-3xl italic text-gray-300">
                  Cliquez pour ajouter une description courte
                </p>
              )}
            </EditableField>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <EditableField field={FICHE_FIELDS.tags} as="div">
              <div className="group flex cursor-pointer flex-wrap gap-1.5">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-blue-300"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-dashed border-blue-300 px-3 py-1 text-xs text-blue-400">
                    + Tags
                  </span>
                )}
              </div>
            </EditableField>

            {typeDispositif.length > 0 && <div className="h-4 w-px bg-gray-200" />}

            <EditableField field={FICHE_FIELDS.typeDispositif} as="div">
              <div className="flex cursor-pointer flex-wrap gap-1.5">
                {typeDispositif.length > 0 ? (
                  typeDispositif.slice(0, 2).map((t: string) => (
                    <span
                      key={t}
                      className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-dashed border-blue-300 px-3 py-1 text-xs text-blue-400">
                    + Dispositifs
                  </span>
                )}
                {typeDispositif.length > 2 && (
                  <span className="px-2 py-1 text-xs text-gray-400">
                    +{typeDispositif.length - 2}
                  </span>
                )}
              </div>
            </EditableField>
          </div>

          <div className="flex flex-wrap lg:-mx-4">
            <div className="w-full pb-10 print:w-full lg:w-8/12 lg:px-4 lg:pb-20">
              <EditableField field={FICHE_FIELDS.resume} className="block">
                {values.resume ? (
                  <Prose html={values.resume} />
                ) : (
                  <EmptyBlock label="Cliquez pour rediger le resume" />
                )}
              </EditableField>

              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 border-t border-gray-200" />
                <span className="px-2 text-xs text-gray-400">Contenu detaille</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {showDetails && (
                <EditableField field={FICHE_FIELDS.contenu} className="block">
                  {values.contenu ? (
                    <Prose html={values.contenu} />
                  ) : (
                    <EmptyBlock label="Cliquez pour rediger le contenu detaille" />
                  )}
                </EditableField>
              )}
            </div>

            <div className="w-full space-y-10 print:hidden lg:w-4/12 lg:px-4">
              <EditableField field={FICHE_FIELDS.outilsIds} className="block">
                <LienBloc
                  title="Quelques outils"
                  liens={outils}
                  isEmpty={outils.length === 0}
                  emptyLabel="Cliquez pour ajouter des outils"
                />
              </EditableField>

              <EditableField field={FICHE_FIELDS.patientsIds} className="block">
                <LienBloc
                  title="Pour les patients"
                  liens={patients}
                  isEmpty={patients.length === 0}
                  emptyLabel="Cliquez pour ajouter des liens patients"
                />
              </EditableField>

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
        </div>
      </Container>

      <div className="fixed bottom-0 left-0 right-0 z-40 select-none bg-gray-900/90 py-2 text-center text-xs text-white">
        Mode edition - Cliquez sur un element pour le modifier dans le panneau lateral
      </div>
    </div>
  )
}
