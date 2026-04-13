'use client'

import { useEditor } from './EditorContext'
import { TextField } from './fields/TextField'
import { TextareaField } from './fields/TextareaField'
import { SelectField } from './fields/SelectField'
import { CheckboxGroupField } from './fields/CheckboxGroupField'
import { RichTextEditor } from './RichTextEditor'

export function InspectorPanel() {
  const { selectedField, values, updateValue, clearSelection } = useEditor()

  if (!selectedField) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-2xl">
          👆
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">
          Cliquez sur un élément
        </p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Survolez n&apos;importe quel texte, image ou bloc dans la preview
          pour voir le contour bleu, puis cliquez pour l&apos;éditer ici.
        </p>
      </div>
    )
  }

  const value = values[selectedField.key]
  const handleChange = (newValue: any) => updateValue(selectedField.key, newValue)

  let fieldTypeLabel = 'Texte'
  if (selectedField.type === 'markdown') {
    fieldTypeLabel = 'Contenu riche'
  } else if (selectedField.type === 'checkboxGroup') {
    fieldTypeLabel = 'Cases à cocher'
  } else if (selectedField.type === 'select') {
    fieldTypeLabel = 'Liste déroulante'
  } else if (selectedField.type === 'textarea') {
    fieldTypeLabel = 'Texte long'
  } else if (selectedField.type === 'image') {
    fieldTypeLabel = 'Image'
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{selectedField.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {fieldTypeLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={clearSelection}
          className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 flex-shrink-0 ml-2"
        >
          ✕
        </button>
      </div>

      {/* Champ d'édition — scrollable */}
      <div className="flex-1 overflow-y-auto p-4">

        {selectedField.type === 'text' && (
          <TextField field={selectedField} value={value ?? ''} onChange={handleChange} />
        )}

        {selectedField.type === 'textarea' && (
          <TextareaField field={selectedField} value={value ?? ''} onChange={handleChange} />
        )}

        {/* Rich text = éditeur WYSIWYG Tiptap */}
        {selectedField.type === 'markdown' && (
          <RichTextEditor
            value={value ?? ''}
            onChange={handleChange}
            placeholder={`Rédigez le ${selectedField.label.toLowerCase()}...`}
          />
        )}

        {selectedField.type === 'select' && (
          <SelectField field={selectedField} value={value ?? ''} onChange={handleChange} />
        )}

        {selectedField.type === 'checkboxGroup' && (
          <CheckboxGroupField field={selectedField} value={value ?? []} onChange={handleChange} />
        )}

        {selectedField.hint && (
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            💡 {selectedField.hint}
          </p>
        )}
      </div>
    </div>
  )
}
