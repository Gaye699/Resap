'use client'

import { AdminStructureForm, AdminStructureFields } from '@/components/admin/AdminStructureForm'
import { updateStructureInContentful, publishStructure } from '@/services/contentful-management'

type Props = {
  id: string
  defaultValues: Partial<AdminStructureFields>
  isPublished: boolean
}

export function EditStructureForm({ id, defaultValues, isPublished: _isPublished }: Props) {
  const handleSave = async (data: AdminStructureFields) => {
    await updateStructureInContentful(id, data)
  }

  const handlePublish = async () => {
    // D'abord sauvegarder les dernières modifications, puis publier
    // Note : si on a déjà sauvegardé juste avant, cette étape est redondante
    // mais elle garantit qu'on publie la version la plus récente.
    await publishStructure(id)
  }

  return (
    <AdminStructureForm
      defaultValues={defaultValues}
      onSave={handleSave}
      // On passe onPublish seulement si la structure existe déjà
      // (en création on ne peut pas publier directement)
      onPublish={handlePublish}
      backHref="/admin/structures"
    />
  )
}
