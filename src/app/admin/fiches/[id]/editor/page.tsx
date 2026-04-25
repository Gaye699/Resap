'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { EditorProvider } from '@/components/admin/editor/EditorContext'
import { EditorToolbar } from '@/components/admin/editor/EditorToolbar'
import { InspectorPanel } from '@/components/admin/editor/InspectorPanel'
import { FicheEditorView } from './FicheEditorView'
import {
  getFicheById,
  updateFicheInContentful,
  updateFicheLiens,
  publishFiche,
  unpublishFiche,
} from '@/services/contentful-management'

export default function FicheEditorPage() {
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [initialValues, setInitialValues] = useState<Record<string, any>>({})
  const [isPublished, setIsPublished] = useState(false)
  const [titre, setTitre] = useState('Nouvelle fiche')

  useEffect(() => {
    getFicheById(id).then((fiche) => {
      // TOUS les champs passés à l'éditeur
      setInitialValues({
        titre: fiche.titre,
        slug: fiche.slug,
        categorie: fiche.categorie,
        description: fiche.description,
        tags: fiche.tags.join(', '),
        resume: fiche.resume,
        contenu: fiche.contenu,
        typeDispositif: fiche.typeDispositif,
        illustrationUrl: fiche.illustrationUrl ?? '',
        illustrationId: fiche.illustrationId ?? '',
        // ← Ces 3 champs étaient manquants = cause du bug
        outilsIds: fiche.outilsIds,
        patientsIds: fiche.patientsIds,
        pourEnSavoirPlusIds: fiche.pourEnSavoirPlusIds,
      })
      setIsPublished(fiche.statut === 'published')
      setTitre(fiche.titre)
      setLoading(false)
    }).catch(() => {
      toast.error('Impossible de charger la fiche.')
    })
  }, [id])

  const handleSave = useCallback(async (values: Record<string, any>) => {
    // 1. Sauvegarde les champs texte/rich text
    await updateFicheInContentful(id, {
      titre: values.titre,
      categorie: values.categorie,
      description: values.description,
      tags: (values.tags ?? '').split(',').map((t: string) => t.trim()).filter(Boolean),
      resume: values.resume,
      contenu: values.contenu,
      typeDispositif: values.typeDispositif ?? [],
    })

    // 2. Sauvegarde les liens associés — SÉPARÉMENT
    // C'était le bug : cette ligne manquait ou les IDs étaient vides
    await updateFicheLiens(id, {
      outils: values.outilsIds ?? [],
      patients: values.patientsIds ?? [],
      pourEnSavoirPlus: values.pourEnSavoirPlusIds ?? [],
    })

    toast.success('Fiche sauvegardée en brouillon.')
    setTitre(values.titre ?? titre)
  }, [id, titre])

  const handlePublish = useCallback(async () => {
    if (isPublished) {
      await unpublishFiche(id)
      toast.success('Fiche dépubliée.')
      setIsPublished(false)
    } else {
      await publishFiche(id)
      toast.success('Fiche publiée sur le site !')
      setIsPublished(true)
    }
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
      isPublished={isPublished}
      onSave={handleSave}
      onPublish={handlePublish}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        <EditorToolbar titre={titre} backHref="/admin/fiches" />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Preview — exactement comme le site public */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
            <FicheEditorView ficheId={id} />
          </div>

          {/* Panneau latéral d'édition */}
          <div style={{
            width: 360,
            borderLeft: '1px solid #e5e7eb',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}
          >
            <InspectorPanel />
          </div>

        </div>
      </div>
    </EditorProvider>
  )
}
