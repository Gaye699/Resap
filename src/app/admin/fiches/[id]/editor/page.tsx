'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { EditorProvider } from '@/components/admin/editor/EditorContext'
import { EditorToolbar } from '@/components/admin/editor/EditorToolbar'
import { InspectorPanel } from '@/components/admin/editor/InspectorPanel'
import {
  getFicheById,
  updateFicheInContentful,
  updateFicheLiens,
  publishFiche,
  unpublishFiche,
  listLiens,
  setFicheIllustration,
} from '@/services/contentful-management'
import { FicheEditorView } from './FicheEditorView'

export default function FicheEditorPage() {
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [initialValues, setInitialValues] = useState<Record<string, any>>({})
  const [isPublished, setIsPublished] = useState(false)
  const [titre, setTitre] = useState('Nouvelle fiche')
  const [allLiens, setAllLiens] = useState<Array<{ id: string; titre: string; url?: string; hasFichier: boolean; statut: string }>>([])
  const [liensLoaded, setLiensLoaded] = useState(false)

  useEffect(() => {
    Promise.all([getFicheById(id), listLiens()]).then(([fiche, liens]) => {
      // TOUS les champs passés à l'éditeur
      setInitialValues({
        titre: fiche.titre,
        slug: fiche.slug,
        categorie: fiche.categorie,
        description: fiche.description,
        tags: fiche.tags ?? [],
        resume: fiche.resume,
        contenu: fiche.contenu,
        typeDispositif: fiche.typeDispositif,
        illustrationUrl: fiche.illustrationUrl ?? '',
        illustrationId: fiche.illustrationId ?? '',
        outilsIds: fiche.outilsIds,
        patientsIds: fiche.patientsIds,
        pourEnSavoirPlusIds: fiche.pourEnSavoirPlusIds,
      })
      setIsPublished(fiche.statut === 'published')
      setTitre(fiche.titre)
      setAllLiens(liens)
      setLiensLoaded(true)
      setLoading(false)
    }).catch(() => {
      toast.error('Impossible de charger la fiche.')
    })
  }, [id])

const handleSave = useCallback(async (values: Record<string, any>) => {
  await updateFicheInContentful(id, {
    titre: values.titre,
    categorie: values.categorie,
    description: values.description,
    tags: Array.isArray(values.tags) ? values.tags : [],
    resume: values.resume,
    contenu: values.contenu,
    typeDispositif: values.typeDispositif ?? [],
  })

  await updateFicheLiens(id, {
    outils: Array.isArray(values.outilsIds) ? values.outilsIds : [],
    patients: Array.isArray(values.patientsIds) ? values.patientsIds : [],
    pourEnSavoirPlus: Array.isArray(values.pourEnSavoirPlusIds)
      ? values.pourEnSavoirPlusIds
      : [],
  })

  if (values.illustrationId) {
    await setFicheIllustration(id, values.illustrationId)
  }

  toast.success('Fiche sauvegardée.')
  setTitre(values.titre ?? titre)
}, [id, titre])

 const handlePublish = useCallback(async (): Promise<'published' | 'draft'> => {
    if (isPublished) {
      await unpublishFiche(id)
      toast.success('Fiche dépubliée.')
      setIsPublished(false)
      return 'draft'
    }

    await publishFiche(id)
    toast.success('Fiche publiée sur le site !')
    setIsPublished(true)
    return 'published'
  }, [id, isPublished])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent
            rounded-full animate-spin mx-auto mb-3"
          />
          <p className="text-sm text-gray-500">Chargement de la fiche...</p>
        </div>
      </div>
    )
  }

  return (
    <EditorProvider
      initialValues={initialValues}
      ficheId={id}
      isPublished={isPublished}
      onSave={handleSave}
      onPublish={handlePublish}
      allLiens={allLiens}
      liensLoaded={liensLoaded}
    >
      <div className="flex h-dvh flex-col overflow-hidden">

        <EditorToolbar titre={titre} backHref="/admin/fiches" />

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">

          {/* Preview */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-white">
            <FicheEditorView ficheId={id} />
          </div>

          {/* Panneau latéral d'édition */}
          <div
            className="relative border-l border-gray-200 bg-white flex flex-col overflow-hidden resize-x"
            style={{ width: 360, minWidth: 280, maxWidth: 560, resize: 'horizontal' }}
          >
            <div className="flex-1 overflow-y-auto min-h-0">
              <InspectorPanel />
            </div>
          </div>

        </div>
      </div>
    </EditorProvider>
  )
}
