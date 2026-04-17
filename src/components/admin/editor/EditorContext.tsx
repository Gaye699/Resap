// src/components/admin/editor/EditorContext.tsx
// Cœur du système d'édition inline.
// Ce contexte est partagé entre toutes les zones éditables et le panneau latéral.
// Quand l'utilisateur clique sur une zone, on met à jour selectedField.
// Quand il modifie une valeur dans le panneau, on met à jour values.
// Les deux composants se synchronisent via ce contexte.

'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react'

// Définition d'un champ éditable — ce qu'on passe à <EditableField>
export type FieldDefinition = {
  // Identifiant unique du champ (ex: 'titre', 'description', 'resume')
  key: string
  // Label affiché dans le panneau (ex: 'Titre de la fiche')
  label: string
  // Type de champ → détermine quel composant afficher dans InspectorPanel
  type: 'text' | 'textarea' | 'markdown' | 'select' | 'checkboxGroup' | 'image' | 'liens'
  // Options pour 'select' et 'checkboxGroup'
  options?: { value: string; label: string }[]
  // Contraintes
  maxLength?: number
  required?: boolean
  // Aide affichée sous le champ
  hint?: string
}

type EditorValues = Record<string, any>

type EditorContextType = {
  // Champ actuellement sélectionné (null = rien de sélectionné)
  selectedField: FieldDefinition | null
  // Toutes les valeurs éditées (état "live" de la page)
  values: EditorValues
  // Valeurs originales (pour détecter les changements non sauvegardés)
  originalValues: EditorValues
  // true si des modifications n'ont pas encore été sauvegardées
  isDirty: boolean
  // true pendant la sauvegarde
  isSaving: boolean
  // true si la resource est publiée
  isPublished: boolean
  // Sélectionne un champ (appelé par EditableField au clic)
  selectField: (field: FieldDefinition) => void
  // Désélectionne le champ actuel (clic en dehors)
  clearSelection: () => void
  // Met à jour la valeur d'un champ (appelé par InspectorPanel)
  updateValue: (key: string, value: any) => void
  // Sauvegarde en brouillon (appelé par EditorToolbar)
  save: () => Promise<void>
  // Publie (appelé par EditorToolbar)
  publish: () => Promise<void>
}

const EditorContext = createContext<EditorContextType | null>(null)

// Hook pour consommer le contexte — lance une erreur claire si mal utilisé
export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider')
  return ctx
}

type EditorProviderProps = {
  children: ReactNode
  // Valeurs initiales chargées depuis Contentful
  initialValues: EditorValues
  isPublished: boolean
  // Fonction de sauvegarde — reçoit les valeurs modifiées
  onSave: (values: EditorValues) => Promise<void>
  // Fonction de publication
  onPublish: () => Promise<void>
}

export function EditorProvider({
  children,
  initialValues,
  isPublished: initialIsPublished,
  onSave,
  onPublish,
}: EditorProviderProps) {
  const [selectedField, setSelectedField] = useState<FieldDefinition | null>(null)
  const [values, setValues] = useState<EditorValues>(initialValues)
  const [originalValues] = useState<EditorValues>(initialValues)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublished, setIsPublished] = useState(initialIsPublished)

  // isDirty = true si au moins une valeur a changé par rapport aux originales
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
      // Après sauvegarde réussie, l'entry repasse en draft si elle était publiée
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
      selectField, clearSelection, updateValue, save, publish],
  )

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  )
}
