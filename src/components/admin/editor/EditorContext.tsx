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
  type: 'text' | 'textarea' | 'richtext' | 'select' | 'checkboxGroup' | 'image' | 'liens' | 'tags'
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
  allLiens: Array<{ id: string; titre: string; url?: string; hasFichier: boolean; statut: string }>
  setAllLiens: (liens: Array<{ id: string; titre: string; url?: string; hasFichier: boolean; statut: string }>) => void
  liensLoaded: boolean
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
  onPublish: () => Promise<'published' | 'draft'>
  allLiens?: Array<{ id: string; titre: string; url?: string; hasFichier: boolean; statut: string }>
  liensLoaded?: boolean
}

export function EditorProvider({
  children,
  initialValues,
  ficheId,
  isPublished: initialIsPublished,
  onSave,
  onPublish,
  allLiens: initialLiens,
  liensLoaded: initialLiensLoaded,
}: EditorProviderProps) {
  const [selectedField, setSelectedField] = useState<FieldDefinition | null>(null)
  const [values, setValues] = useState<EditorValues>(initialValues)
  const [originalValues, setOriginalValues] = useState<EditorValues>(initialValues)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublished, setIsPublished] = useState(initialIsPublished)
  const [allLiens, setAllLiens] = useState<Array<{ id: string; titre: string; url?: string; hasFichier: boolean; statut: string }>>(initialLiens ?? [])
  const [liensLoaded] = useState(initialLiensLoaded ?? false)

  const isDirty = useMemo(() => Object.keys(values).some((key) => {
      const a = values[key]
      const b = originalValues[key]
      if (Array.isArray(a) && Array.isArray(b)) {
        return JSON.stringify(a) !== JSON.stringify(b)
      }
      return a !== b
    }), [values, originalValues])

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
      setOriginalValues({ ...values })
    } finally {
      setIsSaving(false)
    }
  }, [values, onSave])

  const publish = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave(values)
      const nextStatus = await onPublish()
      setIsPublished(nextStatus === 'published')
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
      allLiens,
      setAllLiens,
      liensLoaded,
    }),
    [selectedField, values, originalValues, isDirty, isSaving, isPublished,
      selectField, clearSelection, updateValue, ficheId, save, publish, allLiens, liensLoaded],
  )

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  )
}
