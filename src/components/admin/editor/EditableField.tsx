// src/components/admin/editor/EditableField.tsx
// Wrapper qui rend n'importe quel élément HTML "cliquable" en mode édition.
// Au survol : contour bleu + curseur pointer.
// Au clic : sélectionne le champ dans l'EditorContext.
// En mode non-édition (site public) : transparent, aucun impact.

'use client'

import type { ElementType, ReactNode } from 'react'
import { useRef, useState } from 'react'
import { useEditor, FieldDefinition } from './EditorContext'

type Props = {
  // Définition du champ (clé, label, type...)
  field: FieldDefinition
  // Contenu à afficher (le rendu live depuis les values du contexte)
  children: ReactNode
  // Classes CSS supplémentaires à appliquer sur le wrapper
  className?: string
  // Tag HTML du wrapper (div par défaut)
  as?: ElementType
}

export function EditableField({
  field,
  children,
  className = '',
  as: Tag = 'div',
}: Props) {
  const { selectField, selectedField } = useEditor()
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLElement>(null)

  const isSelected = selectedField?.key === field.key

  const handleClick = (e: React.MouseEvent) => {
    // Stoppe la propagation pour éviter que le clic remonte
    // et déclenche clearSelection sur le layout parent
    e.stopPropagation()
    selectField(field)
  }

  let outline = 'none'
  if (isSelected) {
    outline = '2px solid #3b82f6'
  } else if (isHovered) {
    outline = '2px dashed #93c5fd'
  }

  return (
    // @ts-ignore — Tag dynamique
    <Tag
      ref={ref}
      className={className}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        outline,
      }}
    >
      {children}

      {/* Tooltip au survol */}
      {isHovered && !isSelected && (
        <span
          style={{
            position: 'absolute',
            top: '-24px',
            left: '0',
            outline,
            background: '#1d4ed8',
            color: 'white',
            fontSize: '11px',
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          ✏️ {field.label}
        </span>
      )}

      {/* Badge "sélectionné" */}
      {isSelected && (
        <span
          style={{
            position: 'absolute',
            top: '-24px',
            left: '0',
            background: '#3b82f6',
            color: 'white',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          ✏️ {field.label} — en cours d&apos;édition
        </span>
      )}
    </Tag>
  )
}
