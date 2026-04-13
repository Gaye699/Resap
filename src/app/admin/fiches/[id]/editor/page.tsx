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
  publishFiche,
} from '@/services/contentful-management'
import { FicheEditorView } from './FicheEditorView'

export default function FicheEditorPage() {
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [initialValues, setInitialValues] = useState<Record<string, any>>({})
  const [isPublished, setIsPublished] = useState(false)
  const [titre, setTitre] = useState('')

  useEffect(() => {
    getFicheById(id).then((fiche) => {
      setInitialValues({
        titre: fiche.titre,
        slug: fiche.slug,
        categorie: fiche.categorie,
        description: fiche.description,
        tags: fiche.tags.join(', '),
        resume: fiche.resume,
        contenu: fiche.contenu,
        typeDispositif: fiche.typeDispositif,
      })
      setIsPublished(fiche.statut === 'published')
      setTitre(fiche.titre)
      setLoading(false)
    }).catch(() => {
      toast.error('Impossible de charger la fiche.')
    })
  }, [id])

  // Sauvegarde — reçoit les valeurs modifiées depuis l'EditorContext
  const handleSave = useCallback(async (values: Record<string, any>) => {
    await updateFicheInContentful(id, {
      titre: values.titre,
      categorie: values.categorie,
      description: values.description,
      tags: values.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      resume: values.resume,
      contenu: values.contenu,
      typeDispositif: values.typeDispositif ?? [],
    })
    toast.success('Sauvegardé en brouillon.')
  }, [id])

  // Publication
  const handlePublish = useCallback(async () => {
    await publishFiche(id)
    toast.success('Fiche publiée sur le site !')
    setIsPublished(true)
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chargement de la fiche...</p>
        </div>
      </div>
    )
  }

  return (
    // EditorProvider = fournit le contexte à toute la page
    <EditorProvider
      initialValues={initialValues}
      isPublished={isPublished}
      onSave={handleSave}
      onPublish={handlePublish}
    >
      {/* Layout fixe plein écran */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* Barre du haut */}
        <EditorToolbar titre={titre} backHref="/admin/fiches" />

        {/* Corps : preview + panneau */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Zone preview — scrollable */}
          <div
            style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}
            // Clic en dehors d'une zone éditable → désélectionne
          >
            <FicheEditorView />
          </div>

          {/* Panneau latéral — largeur fixe */}
          <div style={{
            width: 340,
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
