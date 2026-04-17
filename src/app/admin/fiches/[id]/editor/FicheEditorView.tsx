'use client'

import { useEffect, useState } from 'react'
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
import { categories } from '@/data/categories'
import { getStructuresByTypes } from '@/services/contentful-management'

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
  description: {
    key: 'description',
    label: 'Description courte',
    type: 'textarea' as const,
    maxLength: 280,
    hint: 'Texte court de présentation.',
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
    hint: 'Bloc affiché avant le bouton "Afficher les détails".',
  },
  contenu: {
    key: 'contenu',
    label: 'Contenu détaillé',
    type: 'markdown' as const,
    hint: 'Bloc affiché après ouverture des détails.',
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
    ].map((t) => ({ value: t, label: t })),
    hint: 'Détermine les structures liées à la fiche.',
  },
}

type PreviewLink = {
  id: string
  titre: string
}

function PreviewLinksCard({ title, links }: { title: string; links: PreviewLink[] }) {
  if (!links.length) {
    return null
  }

  return (
    <Box title={title}>
      {links.map((link) => (
        <div key={link.id} className="text-blue-default py-3 block hover:text-gray-600">
          {link.titre}
        </div>
      ))}
    </Box>
  )
}

export function FicheEditorView() {
  const { values } = useEditorCtx()
  const [showDetails, setShowDetails] = useState(false)
  const [structures, setStructures] = useState<any[]>([])

  const typeDispositif = Array.isArray(values.typeDispositif) ? values.typeDispositif : []

  useEffect(() => {
    if (typeDispositif.length > 0) {
      getStructuresByTypes(typeDispositif).then(setStructures)
    } else {
      setStructures([])
    }
  }, [typeDispositif])

  const categorie = values.categorie && categories[values.categorie as keyof typeof categories]
      ? categories[values.categorie as keyof typeof categories]
      : categories.sante

  const tags = typeof values.tags === 'string'
      ? values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : []

  const outils = Array.isArray(values.outils) ? values.outils : []
  const patients = Array.isArray(values.patients) ? values.patients : []
  const pourEnSavoirPlus = Array.isArray(values.pourEnSavoirPlus) ? values.pourEnSavoirPlus : []

  const fichePreview = {
    titre: values.titre ?? '',
    categorie: values.categorie ?? 'sante',
    updatedAt: new Date().toISOString(),
  }

  return (
    <div className="bg-white min-h-full">
      <HeaderFiche fiche={fichePreview as any} categorie={categorie} />

      <div className="relative pb-12">
        <Container>
          <FloatingButtons className="absolute top-5 2xl:top-20 xl:left-8" />

          <div className="w-full py-10 lg:py-20">
            <EditableField field={FICHE_FIELDS.titre}>
              <h1 className="mt-10 lg:mt-0 text-3xl md:text-5xl lg:text-6xl text-blue-default">
                {values.titre || <span className="italic text-gray-300">Titre non défini</span>}
              </h1>
            </EditableField>
          </div>

          {tags.length > 0 && (
            <EditableField field={FICHE_FIELDS.tags} as="div" className="mb-6">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </EditableField>
          )}

          <div className="flex lg:-mx-4 flex-wrap">
            <div className="w-full print:w-full lg:w-8/12 lg:px-4 pb-10 lg:pb-20">
              <EditableField field={FICHE_FIELDS.resume} className="block">
                {values.resume ? (
                  <Prose html={values.resume} />
                ) : (
                  <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-blue-50">
                    <p className="text-blue-400 italic text-sm">
                      Cliquez ici pour rédiger le résumé
                    </p>
                  </div>
                )}
              </EditableField>

              <SecondaryButton
                type="button"
                className="print:hidden block my-5 w-1/2 mx-auto"
                onClick={() => setShowDetails(not)}
              >
                {showDetails ? 'Masquer les détails' : 'Afficher les détails'}
              </SecondaryButton>

              {showDetails && (
                <EditableField field={FICHE_FIELDS.contenu} className="block">
                  {values.contenu ? (
                    <Prose html={values.contenu} />
                  ) : (
                    <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-blue-50">
                      <p className="text-blue-400 italic text-sm">
                        Cliquez ici pour rédiger le contenu détaillé
                      </p>
                    </div>
                  )}
                </EditableField>
              )}
            </div>

            <div className="w-full lg:w-4/12 lg:px-4 print:hidden space-y-10">
              <EditableField field={FICHE_FIELDS.typeDispositif} className="block">
                <Box title="Types de dispositif">
                  {typeDispositif.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {typeDispositif.map((item: string) => (
                        <span
                          key={item}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Cliquez pour sélectionner les types de dispositif
                    </p>
                  )}
                </Box>
              </EditableField>

              <EditableField field={FICHE_FIELDS.description} className="block">
                <Box title="Description">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {values.description || (
                      <span className="italic text-gray-300">Aucune description</span>
                    )}
                  </p>
                </Box>
              </EditableField>

              <PreviewLinksCard title="Quelques outils" links={outils} />
              <PreviewLinksCard title="Pour les patients" links={patients} />
              <PreviewLinksCard title="Pour aller plus loin" links={pourEnSavoirPlus} />
            </div>

            <div className="w-full mt-10">
              {structures.length > 0 ? <StructuresList structures={structures} /> : null}
            </div>
          </div>
        </Container>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 text-white text-xs py-2 text-center"
        style={{ background: 'rgba(17, 24, 39, 0.95)', zIndex: 40 }}
      >
        Mode édition : cliquez sur un élément pour le modifier dans le panneau latéral
      </div>
    </div>
  )
}
