'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { EditorProvider } from '@/components/admin/editor/EditorContext'
import { EditorToolbar } from '@/components/admin/editor/EditorToolbar'
import { InspectorPanel } from '@/components/admin/editor/InspectorPanel'
import {
  getStructureById,
  updateStructureInContentful,
  publishStructure,
  deleteStructure,
} from '@/services/contentful-management'
import { StructureEditorView } from './StructureEditorView'
import { useRouter } from 'next/navigation'
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal'

export default function StructureEditorPage() {
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [initialValues, setInitialValues] = useState<Record<string, any>>({})
  const [isPublished, setIsPublished] = useState(false)
  const [nom, setNom] = useState('')

  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    getStructureById(id).then((s) => {
      setInitialValues({
        nom: s.nom,
        organisation: s.organisation,
        type: s.type,
        adresse: s.adresse,
        email: s.email,
        tel: s.tel,
        siteWeb: s.siteWeb,
        description: s.description,
      })
      setIsPublished(s.statut === 'published')
      setNom(s.nom)
      setLoading(false)
    })
  }, [id])

  const handleSave = useCallback(async (values: Record<string, any>) => {
    await updateStructureInContentful(id, values)
    toast.success('Structure sauvegardée en brouillon.')
  }, [id])

  const handlePublish = useCallback(async (): Promise<'published' | 'draft'> => {
    if (isPublished) {
      // si vous voulez supporter la dépublication, il faut aussi importer unpublishStructure
      // sinon au minimum retourner 'published' après publishStructure
    }

    await publishStructure(id)
    toast.success('Structure publiée !')
    setIsPublished(true)
    return 'published'
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
    >

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <EditorToolbar titre={nom} backHref="/admin/structures" />
        <button
          type="button"
          onClick={() => setShowDelete(true)}
          className="fixed top-3 right-4 z-[110] text-xs text-red-500
            hover:text-red-700 border border-red-200 px-3 py-1.5
            rounded-lg hover:bg-red-50 transition-colors"
        >
          🗑 Supprimer
        </button>

        {showDelete && (
          <DeleteConfirmModal
            nom={nom}
            hideTrigger={true}
            defaultOpen={true}
            onConfirm={async () => {
              await deleteStructure(id)
              router.push('/admin/structures')
            }}
            onCancel={() => setShowDelete(false)}
          />
        )}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
            <StructureEditorView />
          </div>
          <div style={{ width: 340, borderLeft: '1px solid #e5e7eb', background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
            <InspectorPanel />
          </div>
        </div>
      </div>
    </EditorProvider>
  )
}
