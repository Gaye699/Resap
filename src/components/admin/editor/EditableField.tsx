'use client'

import React, { useState } from 'react'
import { useEditor, FieldDefinition } from './EditorContext'

type Props = {
  field: FieldDefinition
  children: React.ReactNode
  className?: string
  as?: 'div' | 'span' | 'section' | 'article'
}

export function EditableField({ field, children, className = '', as: Tag = 'div' }: Props) {
  const { selectField, selectedField } = useEditor()
  const [hovered, setHovered] = useState(false)
  const isSelected = selectedField?.key === field.key
  const Component = Tag as React.ElementType

  return (
    // @ts-ignore
    <Component
      className={className}
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); selectField(field) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        // Fond léger permanent → indique que c'est éditable
        background: isSelected
          ? 'rgba(59,130,246,0.06)'
          : hovered
            ? 'rgba(59,130,246,0.03)'
            : 'rgba(59,130,246,0.015)',
        // Outline selon l'état
        outline: isSelected
          ? '2px solid #3b82f6'
          : hovered
            ? '1.5px dashed #93c5fd'
            : '1px dashed rgba(147,197,253,0.4)',
        outlineOffset: '2px',
        borderRadius: '4px',
        transition: 'all 0.12s ease',
      }}
    >
      {children}

      {/* Label "éditable" discret — toujours visible en haut à droite */}
      {!isSelected && (
        <span style={{
          position: 'absolute',
          top: 2,
          right: 4,
          fontSize: 9,
          fontWeight: 600,
          color: 'rgba(59,130,246,0.5)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          userSelect: 'none',
          lineHeight: 1,
        }}
        >
          ✏
        </span>
      )}

      {/* Badge "En cours d'édition" quand sélectionné */}
      {isSelected && (
        <span style={{
          position: 'absolute',
          top: -20,
          left: 0,
          fontSize: 10,
          fontWeight: 600,
          color: 'white',
          background: '#3b82f6',
          padding: '2px 8px',
          borderRadius: '4px 4px 0 0',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}
        >
          ✏️ {field.label}
        </span>
      )}
    </Component>
  )
}
