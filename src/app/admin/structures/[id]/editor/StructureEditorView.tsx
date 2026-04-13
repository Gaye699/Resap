'use client'

import { useEditor } from '@/components/admin/editor/EditorContext'
import { EditableField } from '@/components/admin/editor/EditableField'
import { types } from '@/data/structures_types'

const STRUCTURE_FIELDS = {
  nom: {
    key: 'nom',
    label: 'Nom',
    type: 'text' as const,
    required: true,
  },
  organisation: {
    key: 'organisation', label: 'Organisation / Réseau', type: 'text' as const,
  },
  type: {
    key: 'type',
    label: 'Type de dispositif',
    type: 'select' as const,
    options: Object.keys(types).map((k) => ({ value: k, label: types[k as keyof typeof types].nom })),
  },
  description: {
    key: 'description', label: 'Description', type: 'textarea' as const,
  },
  adresse: {
    key: 'adresse',
    label: 'Adresse',
    type: 'text' as const,
    hint: 'L\'adresse recalcule automatiquement les coordonnées GPS.',
  },
  tel: { key: 'tel', label: 'Téléphone', type: 'text' as const },
  email: { key: 'email', label: 'Email', type: 'text' as const },
  siteWeb: { key: 'siteWeb', label: 'Site web', type: 'text' as const },
}

export function StructureEditorView() {
  const { values } = useEditor()

  return (
    <div style={{ minHeight: '100%' }}>

      {/* Header */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">

          <EditableField field={STRUCTURE_FIELDS.nom}>
            <h1 className="text-4xl font-bold">
              {values.nom || <span className="italic text-blue-300">Nom non défini</span>}
            </h1>
          </EditableField>

          <EditableField field={STRUCTURE_FIELDS.organisation} className="mt-2" as="span">
            <p className="text-blue-200 text-lg">
              {values.organisation || <span className="italic text-blue-400">Organisation non définie</span>}
            </p>
          </EditableField>

          <EditableField field={STRUCTURE_FIELDS.type} className="mt-3" as="span">
            <span className="inline-block text-xs bg-white/10 text-white px-3 py-1.5 rounded-full">
              {values.type || 'Type non défini'}
            </span>
          </EditableField>
        </div>
      </div>

      {/* Corps */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          {/* Description */}
          <EditableField field={STRUCTURE_FIELDS.description} className="p-6 border-b border-gray-100">
            <p className="text-gray-600 leading-relaxed">
              {values.description || <span className="italic text-gray-300">Aucune description</span>}
            </p>
          </EditableField>

          {/* Coordonnées */}
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Coordonnées</h3>

            <EditableField field={STRUCTURE_FIELDS.adresse} as="div">
              <div className="flex items-start gap-3">
                <span className="text-gray-400 mt-0.5">📍</span>
                <span className="text-gray-700">
                  {values.adresse || <span className="italic text-gray-300">Adresse non définie</span>}
                </span>
              </div>
            </EditableField>

            {(values.tel || true) && (
              <EditableField field={STRUCTURE_FIELDS.tel} as="div">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">📞</span>
                  <span className="text-gray-700">
                    {values.tel || <span className="italic text-gray-300">Téléphone non défini</span>}
                  </span>
                </div>
              </EditableField>
            )}

            <EditableField field={STRUCTURE_FIELDS.email} as="div">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">✉️</span>
                <span className="text-gray-700">
                  {values.email || <span className="italic text-gray-300">Email non défini</span>}
                </span>
              </div>
            </EditableField>

            <EditableField field={STRUCTURE_FIELDS.siteWeb} as="div">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">🌐</span>
                {values.siteWeb ? (
                  <a
                    href={values.siteWeb}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {values.siteWeb}
                  </a>
                ) : (
                  <span className="italic text-gray-300">Site web non défini</span>
                )}
              </div>
            </EditableField>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white text-xs py-2 px-4 text-center" style={{ zIndex: 40 }}>
        🖊️ Mode édition — Cliquez sur n&apos;importe quel élément pour le modifier
      </div>
    </div>
  )
}
