
'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react'

// Définition d'un champ éditable 
export type FieldDefinition = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'richtext' | 'select' | 'checkboxGroup' | 'image' | 'liens'
  options?: { value: string; label: string }[]
  maxLength?: number
  required?: boolean
  hint?: string
}

type EditorValues = Record<string, any>

type EditorContextType = {
  selectedField: FieldDefinition | null
  values: EditorValues
  ficheId: string
  originalValues: EditorValues
  isDirty: boolean
  isSaving: boolean
  isPublished: boolean
  selectField: (field: FieldDefinition) => void
  clearSelection: () => void
  updateValue: (key: string, value: any) => void
  save: () => Promise<void>
  publish: () => Promise<void>
}

const EditorContext = createContext<EditorContextType | null>(null)

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider')
  return ctx
}

type EditorProviderProps = {
  children: ReactNode
  initialValues: EditorValues
  ficheId: string
  isPublished: boolean
  onSave: (values: EditorValues) => Promise<void>
  onPublish: () => Promise<void>
}

export function EditorProvider({
  children,
  initialValues,
  ficheId,
  isPublished: initialIsPublished,
  onSave,
  onPublish,
}: EditorProviderProps) {
  const [selectedField, setSelectedField] = useState<FieldDefinition | null>(null)
  const [values, setValues] = useState<EditorValues>(initialValues)
  const [originalValues] = useState<EditorValues>(initialValues)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublished, setIsPublished] = useState(initialIsPublished)

  const isDirty = useMemo(
    () => Object.keys(values).some((key) => values[key] !== originalValues[key]),
    [values, originalValues],
  )

  const selectField = useCallback((field: FieldDefinition) => {
    setSelectedField(field)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedField(null)
  }, [])

  const updateValue = useCallback((key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const save = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave(values)
      setIsPublished(false)
    } finally {
      setIsSaving(false)
    }
  }, [values, onSave])

  const publish = useCallback(async () => {
    setIsSaving(true)
    try {
      // Sauvegarde d'abord les modifications en cours, puis publie
      await onSave(values)
      await onPublish()
      setIsPublished(true)
    } finally {
      setIsSaving(false)
    }
  }, [values, onSave, onPublish])

  const contextValue = useMemo(
    () => ({
      selectedField,
      values,
      ficheId,
      originalValues,
      isDirty,
      isSaving,
      isPublished,
      selectField,
      clearSelection,
      updateValue,
      save,
      publish,
    }),
    [selectedField, values, originalValues, isDirty, isSaving, isPublished,
      selectField, clearSelection, updateValue, ficheId, save, publish],
  )

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  )
}
